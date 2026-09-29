import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi, discoveryApiRef, fetchApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { MarkdownContent } from '@backstage/core-components';
import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/ArrowUpward';
import StopIcon from '@material-ui/icons/Stop';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import ChatIcon from '@material-ui/icons/ChatBubbleOutline';
import useAsync from 'react-use/lib/useAsync';
import { Alert, AtlasLogo, AtlasPage, Modal } from '../../components';
import { AgentClient, type Activity, type ChatMessage, type Conversation } from './agentClient';

const SUGGESTIONS = [
  'Quais ofertas existem para criar um banco de dados?',
  'Quais APIs estão registradas no catálogo e quem é dono de cada uma?',
  'Como peço acesso emergencial a uma conta AWS?',
  'Por onde começo se acabei de entrar no time?',
];

/** "agora", "há 5 min", "há 3 h", "ontem", "12/09". */
function when(iso: string): string {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (minutes < 24 * 60) return `há ${Math.round(minutes / 60)} h`;
  if (minutes < 48 * 60) return 'ontem';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

type Pending = { text: string; activity: Activity[] };
type LocalMessage = ChatMessage & { error?: boolean; interrupted?: boolean };

function Tools({ activity }: { activity: Activity[] }) {
  if (!activity.length) return null;
  return (
    <div className="atlas-chatTools">
      {activity.map((a, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="atlas-chatTool">
          <SearchIcon style={{ fontSize: 13 }} /> {a.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Agente do Atlas. O que a tela deve conter está em `README.md`.
 *
 * A conversa ativa fica na URL (`?c=<id>`): dá para voltar a ela pelo link,
 * e o histórico do navegador anda entre conversas.
 */
export function AgentPage() {
  const discovery = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const client = useMemo(() => new AgentClient(discovery, fetchApi), [discovery, fetchApi]);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c');

  const { value: status, loading: statusLoading } = useAsync(() => client.status(), [client]);
  const { value: profile } = useAsync(() => identityApi.getProfileInfo(), [identityApi]);
  const initials = (profile?.displayName ?? 'Você')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const conversations = useAsyncRetry(() => client.list(), [client]);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [pending, setPendingState] = useState<Pending | null>(null);
  // Espelho do estado para ler o parcial fora do render (ao interromper).
  const pendingRef = useRef<Pending | null>(null);
  const setPending = (update: Pending | null | ((p: Pending | null) => Pending | null)) => {
    pendingRef.current = typeof update === 'function' ? update(pendingRef.current) : update;
    setPendingState(pendingRef.current);
  };
  const [draft, setDraft] = useState('');
  const [toDelete, setToDelete] = useState<Conversation | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Enquanto a primeira mensagem de uma conversa nova está indo, não recarrega
  // a conversa pela URL (apagaria a mensagem otimista).
  const creatingRef = useRef(false);

  const active = conversations.value?.find(c => c.id === activeId);
  const busy = Boolean(pending);
  const canChat = Boolean(status?.configured);

  const openConversation = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('c', id);
    else next.delete('c');
    setParams(next);
  };

  // Carrega as mensagens da conversa escolhida.
  useEffect(() => {
    if (creatingRef.current) return undefined;
    abortRef.current?.abort();
    setPending(null);
    if (!activeId) {
      setMessages([]);
      return undefined;
    }
    let alive = true;
    setLoadingConversation(true);
    client
      .get(activeId)
      .then(result => alive && setMessages(result.messages))
      .catch(() => alive && setMessages([]))
      .finally(() => alive && setLoadingConversation(false));
    return () => {
      alive = false;
    };
  }, [activeId, client]);

  // Rola para o fim quando chega texto novo.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  // Campo cresce com o texto, até o limite do CSS.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy || !canChat) return;
      setDraft('');

      let id = activeId;
      if (!id) {
        creatingRef.current = true;
        const created = await client.create();
        id = created.id;
        openConversation(id);
      }

      const optimistic: LocalMessage = {
        id: `local-${Date.now()}`,
        role: 'user',
        content,
        activity: [],
        createdAt: new Date().toISOString(),
      };
      setMessages(current => [...current, optimistic]);
      setPending({ text: '', activity: [] });

      const controller = new AbortController();
      abortRef.current = controller;
      let finished = false;
      try {
        await client.send(
          id,
          content,
          event => {
            if (event.type === 'delta') setPending(p => p && { ...p, text: p.text + event.text });
            if (event.type === 'reset') setPending(p => p && { ...p, text: '' });
            if (event.type === 'activity') setPending(p => p && { ...p, activity: [...p.activity, { tool: '', label: event.label }] });
            if (event.type === 'done') {
              finished = true;
              setMessages(current => [...current, event.message]);
              setPending(null);
            }
            if (event.type === 'failed') {
              finished = true;
              setMessages(current => [
                ...current,
                { id: `err-${Date.now()}`, role: 'assistant', content: event.message, activity: [], createdAt: new Date().toISOString(), error: true },
              ]);
              setPending(null);
            }
          },
          controller.signal,
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessages(current => [
            ...current,
            {
              id: `err-${Date.now()}`,
              role: 'assistant',
              content: error instanceof Error ? error.message : 'O agente não conseguiu responder.',
              activity: [],
              createdAt: new Date().toISOString(),
              error: true,
            },
          ]);
        }
      } finally {
        if (!finished) {
          // Interrompido: mostra o que já tinha chegado, marcado como parcial.
          const partial = pendingRef.current;
          if (partial?.text) {
            setMessages(current => [
              ...current,
              { id: `cut-${Date.now()}`, role: 'assistant', content: partial.text, activity: partial.activity, createdAt: new Date().toISOString(), interrupted: true },
            ]);
          }
          setPending(null);
        }
        abortRef.current = null;
        creatingRef.current = false;
        conversations.retry();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId, busy, canChat, client],
  );

  // Links internos do Markdown navegam dentro do portal, sem recarregar.
  const onBubbleClick = (e: MouseEvent<HTMLDivElement>) => {
    // O link do MarkdownContent pode já ter navegado sozinho; navegar de novo
    // duplicaria a entrada no histórico e o "voltar" não sairia do lugar.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const anchor = (e.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (href && href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    await client.remove(toDelete.id);
    if (toDelete.id === activeId) openConversation(null);
    setToDelete(null);
    conversations.retry();
  };

  const list = conversations.value ?? [];

  return (
    <AtlasPage
      eyebrow="Assistente"
      title="Agente do Atlas"
      subtitle="Pergunte sobre serviços, APIs, ofertas e telas do portal. As conversas ficam salvas no seu histórico."
    >
      {!statusLoading && status && !status.configured && (
        <Alert variant="warning" title="Agente ainda não configurado">
          Falta a credencial da Anthropic no backend ({status.reason}). Defina <code className="atlas-costMono">ANTHROPIC_API_KEY</code> no{' '}
          <code className="atlas-costMono">.env</code> do portal e reinicie o backend. O histórico continua disponível para leitura.
        </Alert>
      )}

      <div className="atlas-chatLayout">
        <aside className="atlas-sectionCard" style={{ padding: 12, gap: 10 }} aria-label="Histórico de conversas">
          <button
            type="button"
            className="atlas-btnPill atlas-btnPillLime"
            style={{ justifyContent: 'center' }}
            onClick={() => {
              openConversation(null);
              textareaRef.current?.focus();
            }}
          >
            <AddIcon style={{ fontSize: 16 }} /> Nova conversa
          </button>
          <div className="atlas-groupViewLabel" style={{ padding: '4px 4px 0' }}>Histórico</div>
          <div className="atlas-convList">
            {conversations.loading && !list.length ? (
              <div className="atlas-skeletonLine" style={{ width: '80%', margin: 8 }} />
            ) : list.length === 0 ? (
              <p className="atlas-convMeta" style={{ padding: '4px 8px', margin: 0 }}>
                Nenhuma conversa ainda. A primeira pergunta cria uma.
              </p>
            ) : (
              list.map(c => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-current={c.id === activeId ? 'true' : undefined}
                  className={`atlas-convItem ${c.id === activeId ? 'atlas-convItemActive' : ''}`}
                  onClick={() => openConversation(c.id)}
                  onKeyDown={e => e.key === 'Enter' && openConversation(c.id)}
                >
                  <ChatIcon style={{ fontSize: 15, flexShrink: 0 }} />
                  <span className="atlas-convText">
                    <span className="atlas-convTitle">{c.title}</span>
                    <span className="atlas-convMeta">{when(c.updatedAt)}</span>
                  </span>
                  <button
                    type="button"
                    className="atlas-actionBtnLink atlas-actionBtnDanger atlas-convDelete"
                    aria-label={`Apagar a conversa ${c.title}`}
                    title="Apagar conversa"
                    onClick={e => {
                      e.stopPropagation();
                      setToDelete(c);
                    }}
                  >
                    <DeleteIcon style={{ fontSize: 15 }} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="atlas-sectionCard atlas-chat" aria-label="Conversa">
          <div className="atlas-chatHeader">
            <span className="atlas-chatTitle">{active?.title ?? 'Nova conversa'}</span>
            {status?.configured && <span className="atlas-convMeta">{status.model}</span>}
          </div>

          <div className="atlas-chatMessages" ref={scrollRef} onClick={onBubbleClick} aria-live="polite">
            {loadingConversation ? (
              <>
                <div className="atlas-skeletonLine" style={{ width: '40%', alignSelf: 'flex-end' }} />
                <div className="atlas-skeletonLine" style={{ width: '70%' }} />
              </>
            ) : messages.length === 0 && !pending ? (
              <div className="atlas-chatEmpty">
                <span className="atlas-chatAvatar atlas-chatAvatarAgent" style={{ width: 48, height: 48, borderRadius: 14 }}>
                  <AtlasLogo variant="symbol" title="" />
                </span>
                <div>
                  <div className="atlas-sectionCardTitle" style={{ justifyContent: 'center' }}>Como posso ajudar?</div>
                  <p className="atlas-text" style={{ marginTop: 4 }}>
                    Eu consulto o catálogo com as suas permissões e indico a tela certa. Não provisiono nem aprovo nada.
                  </p>
                </div>
                <div className="atlas-chatSuggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s} type="button" className="atlas-chatSuggestion" disabled={!canChat} onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map(m =>
                  m.role === 'user' ? (
                    <div key={m.id} className="atlas-chatRow atlas-chatRowUser">
                      <span className="atlas-chatAvatar">{initials}</span>
                      <div className="atlas-chatStack">
                        <div className="atlas-chatBubble atlas-chatBubbleUser">{m.content}</div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="atlas-chatRow">
                      <span className="atlas-chatAvatar atlas-chatAvatarAgent"><AtlasLogo variant="symbol" title="" /></span>
                      <div className="atlas-chatStack">
                        <Tools activity={m.activity} />
                        <div className={`atlas-chatBubble atlas-chatBubbleAgent ${m.error ? 'atlas-chatBubbleError' : ''}`}>
                          {m.error ? m.content : <MarkdownContent content={m.content} dialect="gfm" />}
                        </div>
                        {m.interrupted && <span className="atlas-chatMeta">Interrompida — esta parte não foi salva.</span>}
                      </div>
                    </div>
                  ),
                )}
                {pending && (
                  <div className="atlas-chatRow">
                    <span className="atlas-chatAvatar atlas-chatAvatarAgent"><AtlasLogo variant="symbol" title="" /></span>
                    <div className="atlas-chatStack">
                      <Tools activity={pending.activity} />
                      <div className="atlas-chatBubble atlas-chatBubbleAgent">
                        {pending.text ? (
                          <MarkdownContent content={pending.text} dialect="gfm" />
                        ) : (
                          <span className="atlas-typing" aria-label="O agente está respondendo">
                            <span />
                            <span />
                            <span />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <form
              className="atlas-chatComposer"
              onSubmit={e => {
                e.preventDefault();
                send(draft);
              }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={draft}
                disabled={!canChat}
                placeholder={canChat ? 'Pergunte ao agente do Atlas' : 'Agente indisponível até a credencial ser configurada'}
                aria-label="Mensagem para o agente"
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
              />
              {busy ? (
                <button type="button" className="atlas-btnPill" onClick={() => abortRef.current?.abort()} aria-label="Parar resposta">
                  <StopIcon style={{ fontSize: 16 }} /> Parar
                </button>
              ) : (
                <button
                  type="submit"
                  className="atlas-btnPill atlas-btnPillLime"
                  disabled={!canChat || !draft.trim()}
                  aria-label="Enviar"
                >
                  <SendIcon style={{ fontSize: 16 }} /> Enviar
                </button>
              )}
            </form>
            <div className="atlas-chatHint">Enter envia · Shift + Enter quebra a linha</div>
          </div>
        </section>
      </div>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Apagar conversa"
        footer={
          <>
            <button type="button" className="atlas-btnPill" onClick={() => setToDelete(null)}>Voltar</button>
            <button
              type="button"
              className="atlas-btnPill"
              style={{ color: 'var(--danger)', borderColor: 'rgba(255, 82, 82, 0.4)' }}
              onClick={confirmDelete}
            >
              Apagar
            </button>
          </>
        }
      >
        <p className="atlas-text">
          Apagar <strong>{toDelete?.title}</strong> e todas as mensagens dela? Não dá para desfazer.
        </p>
      </Modal>
    </AtlasPage>
  );
}
