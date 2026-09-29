import { json } from 'express';
import type { Request, Response, Router } from 'express';
// Router do express-promise-router: handlers async que lançam viram next(err).
import PromiseRouter from 'express-promise-router';
import Anthropic from '@anthropic-ai/sdk';
import { InputError, NotFoundError } from '@backstage/errors';
import type { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import type { CatalogService } from '@backstage/plugin-catalog-node';
import { DEFAULT_TITLE, type Conversation, type ConversationStore, type StoredMessage } from '../database/ConversationStore';
import { AgentRefusalError, type AgentEvent, type AtlasAgent } from '../agent/AtlasAgent';

type Options = {
  store: ConversationStore;
  agent: AtlasAgent;
  catalog: CatalogService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
};

const MAX_MESSAGE_LENGTH = 8000;

const serializeConversation = (c: Conversation) => ({
  id: c.id,
  title: c.title,
  createdAt: c.createdAt.toISOString(),
  updatedAt: c.updatedAt.toISOString(),
});

const serializeMessage = (m: StoredMessage) => ({
  id: m.id,
  role: m.role,
  content: m.content,
  activity: m.activity,
  createdAt: m.createdAt.toISOString(),
});

/** Título da conversa a partir da primeira pergunta. */
const titleFrom = (text: string) => {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length > 60 ? `${oneLine.slice(0, 57)}…` : oneLine;
};

export async function createRouter(options: Options): Promise<Router> {
  const { store, agent, catalog, httpAuth, logger } = options;
  const router: Router = PromiseRouter();
  router.use(json());

  const user = async (req: Request) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    return { credentials, owner: credentials.principal.userEntityRef };
  };

  const ownConversation = async (owner: string, id: string) => {
    const conversation = await store.get(owner, id);
    // Conversa de outra pessoa responde igual a inexistente.
    if (!conversation) throw new NotFoundError('Conversa não encontrada');
    return conversation;
  };

  router.get('/status', async (req, res) => {
    await user(req);
    res.json(await agent.status());
  });

  router.get('/conversations', async (req, res) => {
    const { owner } = await user(req);
    res.json({ conversations: (await store.list(owner)).map(serializeConversation) });
  });

  router.post('/conversations', async (req, res) => {
    const { owner } = await user(req);
    const conversation = await store.create(owner);
    res.status(201).json(serializeConversation(conversation));
  });

  router.get('/conversations/:id', async (req, res) => {
    const { owner } = await user(req);
    const conversation = await ownConversation(owner, req.params.id);
    const messages = await store.messages(conversation.id);
    res.json({ conversation: serializeConversation(conversation), messages: messages.map(serializeMessage) });
  });

  router.patch('/conversations/:id', async (req, res) => {
    const { owner } = await user(req);
    await ownConversation(owner, req.params.id);
    const title = String(req.body?.title ?? '').trim();
    if (!title) throw new InputError('Título vazio');
    await store.rename(owner, req.params.id, title.slice(0, 120));
    res.status(204).end();
  });

  router.delete('/conversations/:id', async (req, res) => {
    const { owner } = await user(req);
    await ownConversation(owner, req.params.id);
    await store.remove(owner, req.params.id);
    res.status(204).end();
  });

  /**
   * Envia uma mensagem e transmite a resposta por Server-Sent Events:
   *   activity → uma consulta que o agente fez ({ label })
   *   delta    → pedaço de texto da resposta ({ text })
   *   reset    → descarte o texto transmitido até aqui (troca por fallback)
   *   done     → resposta final gravada ({ message, conversation })
   *   failed   → não deu para responder ({ message })
   */
  router.post('/conversations/:id/messages', async (req, res) => {
    const { owner, credentials } = await user(req);
    const conversation = await ownConversation(owner, req.params.id);

    const content = String(req.body?.content ?? '').trim();
    if (!content) throw new InputError('Mensagem vazia');
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new InputError(`Mensagem longa demais (máximo ${MAX_MESSAGE_LENGTH} caracteres)`);
    }

    const status = await agent.status();
    if (!status.configured) {
      res.status(503).json({ error: { name: 'AgentNotConfigured', message: `Agente indisponível: ${status.reason}` } });
      return;
    }

    await store.addMessage(conversation.id, 'user', content);
    if (conversation.title === DEFAULT_TITLE) await store.rename(owner, conversation.id, titleFrom(content));
    const history = await store.messages(conversation.id);

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      // Se houver compressão no caminho, ela segura os bytes até o fim.
      (res as Response & { flush?: () => void }).flush?.();
    };

    // Fechou a aba ou apertou "Parar": interrompe a chamada ao modelo.
    const controller = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) controller.abort();
    });

    try {
      const answer = await agent.reply({
        history,
        catalog,
        credentials,
        signal: controller.signal,
        emit: (event: AgentEvent) => send(event.type, event),
      });
      const saved = await store.addMessage(
        conversation.id,
        'assistant',
        answer.text || '_Sem resposta._',
        answer.activity,
      );
      const updated = await store.get(owner, conversation.id);
      send('done', { message: serializeMessage(saved), conversation: updated && serializeConversation(updated) });
    } catch (error) {
      if (controller.signal.aborted) {
        logger.info(`Resposta interrompida pelo usuário na conversa ${conversation.id}`);
      } else if (error instanceof AgentRefusalError) {
        send('failed', { message: 'O modelo não respondeu a esse pedido. Reformule a pergunta.' });
      } else if (error instanceof Anthropic.AuthenticationError) {
        agent.invalidateStatus();
        send('failed', { message: 'A credencial da Anthropic foi recusada. Avise quem administra o portal.' });
      } else if (error instanceof Anthropic.RateLimitError) {
        send('failed', { message: 'Muitas perguntas ao mesmo tempo. Tente de novo em alguns segundos.' });
      } else if (error instanceof Anthropic.APIError) {
        logger.error(`Erro da API da Anthropic: ${error.status} ${error.message}`);
        send('failed', { message: 'O agente não conseguiu responder agora. Tente de novo.' });
      } else {
        logger.error(`Falha no agente: ${error instanceof Error ? error.stack : String(error)}`);
        send('failed', { message: 'O agente não conseguiu responder agora. Tente de novo.' });
      }
    } finally {
      res.end();
    }
  });

  return router;
}
