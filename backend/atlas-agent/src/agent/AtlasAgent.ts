import Anthropic from '@anthropic-ai/sdk';
import type { BackstageCredentials, LoggerService } from '@backstage/backend-plugin-api';
import type { CatalogService } from '@backstage/plugin-catalog-node';
import type { Activity, StoredMessage } from '../database/ConversationStore';
import { TOOLS, runTool } from './tools';

/**
 * Instruções do agente. Estáveis de propósito (sem data, sem usuário): ficam
 * no início do prefixo, que é o que o cache de prompt reaproveita entre
 * mensagens.
 */
export const SYSTEM_PROMPT = `Você é o Agente do Atlas, o assistente do portal de desenvolvedor Atlas (construído sobre o Backstage). Você ajuda desenvolvedores a encontrar serviços, APIs e ofertas, entender quem é dono do quê e chegar à tela certa do portal.

Telas do portal (use estes caminhos como links):
- Home: /
- Catálogo (aplicações, sistemas, recursos, squads): /catalog
- Meus grupos: /my-groups
- Aprovações (minhas aprovações e minhas solicitações de provisionamento): /approvals
- APIs: /api-docs
- Docs (TechDocs): /docs
- Trilhas de aprendizado: /learning-paths
- Ofertas (para provisionar recursos e criar repositórios): /create
- Mapa de provisionamento (onde cada recurso está, por ambiente dev, perf, int, ext, prod, prdnv): /provisioning-map
- Break Glass (acesso emergencial, temporário e auditado a contas AWS): /break-glass
- Atlas × Jira (issues do GitHub que viram cards no Jira): /atlas-jira
- API Keys: /api-keys
- Administração: /admin
- Notificações: /notifications
- Configurações: /settings
Neste ambiente de laboratório, Aprovações, Mapa de provisionamento e Atlas × Jira mostram dados de exemplo.

No Atlas, os templates do scaffolder (entidades do tipo Template no catálogo) se chamam **ofertas**. Com as pessoas, diga sempre "oferta", nunca "template".

Como responder:
- Responda em português do Brasil, de forma direta e curta. Use listas quando houver vários itens.
- Para qualquer afirmação sobre o que existe no catálogo (nomes, donos, ofertas, APIs), consulte as ferramentas antes. Não invente nomes, donos nem links. Se a busca não encontrar, diga isso e sugira onde procurar.
- Ao citar uma entidade, use o link do portal devolvido pela ferramenta, em Markdown: [nome](/catalog/...). Para ofertas, o link leva ao formulário da oferta.
- Você só consulta. Não provisiona, não aprova, não cria chaves e não altera nada: indique a tela e o caminho para a pessoa fazer.
- A pessoa só vê do catálogo o que tem permissão para ver, e você também; se algo não aparece, pode ser falta de permissão.`;

export type AgentEvent =
  | { type: 'delta'; text: string }
  | { type: 'activity'; label: string }
  /** O texto transmitido até aqui foi descartado (troca de modelo por fallback). */
  | { type: 'reset' };

export type AgentStatus = { configured: boolean; model: string; reason?: string };

/** Histórico mandado ao modelo: as últimas mensagens da conversa, só texto. */
const HISTORY_LIMIT = 40;
const STATUS_TTL_MS = 5 * 60 * 1000;

export class AgentRefusalError extends Error {}

export class AtlasAgent {
  private client: Anthropic | undefined;
  private cachedStatus: { at: number; value: AgentStatus } | undefined;

  constructor(
    private readonly options: {
      model: string;
      effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
      maxToolRounds: number;
      logger: LoggerService;
    },
  ) {}

  /**
   * O cliente resolve a credencial sozinho (ANTHROPIC_API_KEY, ou
   * ANTHROPIC_AUTH_TOKEN, ou um perfil do `ant auth login`). Criado sob
   * demanda: sem credencial, o portal sobe normalmente e a tela do agente
   * explica o que falta.
   */
  private getClient(): Anthropic {
    if (!this.client) this.client = new Anthropic();
    return this.client;
  }

  /** A credencial funciona? Uma leitura barata do modelo, com cache de 5 min. */
  async status(): Promise<AgentStatus> {
    const { model, logger } = this.options;
    if (this.cachedStatus && Date.now() - this.cachedStatus.at < STATUS_TTL_MS) {
      return this.cachedStatus.value;
    }
    let value: AgentStatus;
    try {
      await this.getClient().models.retrieve(model);
      value = { configured: true, model };
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        value = { configured: false, model, reason: 'credencial recusada pela API da Anthropic' };
      } else if (error instanceof Anthropic.NotFoundError) {
        value = { configured: false, model, reason: `modelo ${model} não disponível para esta credencial` };
      } else if (error instanceof Anthropic.APIConnectionError) {
        value = { configured: false, model, reason: 'sem conexão com a API da Anthropic' };
      } else if (error instanceof Anthropic.APIError) {
        value = { configured: false, model, reason: `a API respondeu ${error.status}` };
      } else {
        // Sem credencial nenhuma o SDK falha antes de chamar a rede.
        value = { configured: false, model, reason: 'nenhuma credencial configurada' };
      }
      logger.info(`Agente do Atlas indisponível: ${value.reason}`);
    }
    this.cachedStatus = { at: Date.now(), value };
    return value;
  }

  /** Esquece o status em cache — após um erro de autenticação no meio do uso. */
  invalidateStatus() {
    this.cachedStatus = undefined;
  }

  /**
   * Responde à última mensagem do histórico. Transmite o texto por `emit`
   * enquanto é gerado e devolve a resposta final, já sem o que um fallback
   * tenha descartado.
   */
  async reply(input: {
    history: StoredMessage[];
    catalog: CatalogService;
    credentials: BackstageCredentials;
    signal: AbortSignal;
    emit: (event: AgentEvent) => void;
  }): Promise<{ text: string; activity: Activity[] }> {
    const { model, effort, maxToolRounds } = this.options;
    const { history, catalog, credentials, signal, emit } = input;

    const messages: Anthropic.Beta.BetaMessageParam[] = history
      .slice(-HISTORY_LIMIT)
      .map(m => ({ role: m.role, content: m.content }));
    // O histórico cortado precisa começar pelo usuário.
    while (messages.length && messages[0].role !== 'user') messages.shift();

    const activity: Activity[] = [];
    const parts: string[] = [];
    let jsonRetries = 0;

    for (let round = 0; round < maxToolRounds; round++) {
      const stream = this.getClient().beta.messages.stream(
        {
          model,
          max_tokens: 16000,
          system: SYSTEM_PROMPT,
          tools: TOOLS,
          messages,
          thinking: { type: 'adaptive' },
          output_config: { effort },
          // Cache automático do prefixo (instruções + ferramentas + histórico).
          cache_control: { type: 'ephemeral' },
          // Se o modelo recusar, a API refaz no modelo recomendado para a
          // categoria da recusa, dentro da mesma chamada.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        },
        { signal },
      );
      stream.on('text', text => emit({ type: 'delta', text }));

      let message: Anthropic.Beta.BetaMessage;
      try {
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (error) {
        // Só a falha de parse de uma entrada de ferramenta é refeita; erros
        // da API (e o abort do usuário) sobem.
        if (error instanceof Anthropic.APIError || signal.aborted || jsonRetries++ >= 2) throw error;
        emit({ type: 'reset' });
        continue;
      }

      // Com fallback, o que veio antes do bloco `fallback` foi descartado.
      const lastFallback = message.content.map(b => b.type).lastIndexOf('fallback');
      if (lastFallback >= 0) emit({ type: 'reset' });
      const kept = message.content.slice(lastFallback + 1);
      const text = kept
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      if (message.stop_reason === 'refusal') throw new AgentRefusalError();

      if (message.stop_reason === 'pause_turn') {
        messages.push({ role: 'assistant', content: message.content });
        continue;
      }

      const toolUses = message.content.filter(
        (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use',
      );
      if (text.trim()) parts.push(text.trim());

      if (message.stop_reason === 'max_tokens') {
        // Uma entrada de ferramenta cortada costuma parecer válida: nunca rodar.
        if (toolUses.length) throw new Error('entrada de ferramenta truncada (max_tokens)');
        parts.push('_A resposta foi cortada por tamanho._');
        return { text: parts.join('\n\n'), activity };
      }
      if (message.stop_reason !== 'tool_use' || toolUses.length === 0) {
        return { text: parts.join('\n\n'), activity };
      }

      messages.push({ role: 'assistant', content: message.content });

      // Várias consultas no mesmo turno rodam juntas, e os resultados voltam
      // todos numa única mensagem.
      const results = await Promise.all(
        toolUses.map(async block => {
          try {
            const run = await runTool(block.name, block.input, { catalog, credentials });
            activity.push({ tool: block.name, label: run.label });
            emit({ type: 'activity', label: run.label });
            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: run.content,
              is_error: run.isError,
            };
          } catch (error) {
            const reason = error instanceof Error ? error.message : String(error);
            this.options.logger.warn(`Ferramenta ${block.name} falhou: ${reason}`);
            return {
              type: 'tool_result' as const,
              tool_use_id: block.id,
              content: JSON.stringify({ erro: 'a consulta ao catálogo falhou' }),
              is_error: true,
            };
          }
        }),
      );
      messages.push({ role: 'user', content: results });
      // Separa visualmente o texto de antes das consultas do que vem depois.
      emit({ type: 'delta', text: '\n\n' });
    }

    parts.push(`_Parei depois de ${maxToolRounds} rodadas de consulta. Refaça a pergunta de forma mais específica._`);
    return { text: parts.join('\n\n'), activity };
  }
}
