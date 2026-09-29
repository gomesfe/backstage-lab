import React, { useEffect, useMemo, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useAsync from 'react-use/lib/useAsync';
import useDebounce from 'react-use/lib/useDebounce';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { notificationsApiRef } from '@backstage/plugin-notifications';
import type { Notification, NotificationSeverity } from '@backstage/plugin-notifications-common';
import { ResponseErrorPanel } from '@backstage/core-components';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import LowIcon from '@material-ui/icons/NotificationsNone';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import MarkReadIcon from '@material-ui/icons/Drafts';
import MarkUnreadIcon from '@material-ui/icons/MarkunreadOutlined';
import ArrowIcon from '@material-ui/icons/CallMade';
import { AtlasPage, Tabs } from '../../components';
import { notifyStatusChanged } from './useUnreadCount';

type View = 'unread' | 'all' | 'saved';

const PAGE_SIZE = 30;

const SEVERITY: Record<NotificationSeverity, { label: string; icon: JSX.Element }> = {
  critical: { label: 'Crítica', icon: <ErrorIcon fontSize="small" /> },
  high: { label: 'Alta', icon: <WarningIcon fontSize="small" /> },
  normal: { label: 'Normal', icon: <InfoIcon fontSize="small" /> },
  low: { label: 'Baixa', icon: <LowIcon fontSize="small" /> },
};

/** "há 5 min", "há 3 h", "ontem às 14:05", "12/09 às 09:30". */
function when(date: Date): string {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (minutes < 6 * 60) return `há ${Math.round(minutes / 60)} h`;
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (dayGroup(date) === 'Ontem') return `ontem às ${time}`;
  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${time}`;
}

function dayGroup(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff <= 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return 'Esta semana';
  return 'Mais antigas';
}

const isExternal = (link: string) => /^https?:\/\//i.test(link);

/** Link da notificação: rota do portal vira RouterLink; URL externa abre em nova aba. */
function NotificationLink({
  link,
  onOpen,
  children,
  ...rest
}: {
  link: string;
  onOpen: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
}) {
  return isExternal(link) ? (
    <a href={link} target="_blank" rel="noreferrer noopener" onClick={onOpen} {...rest}>
      {children}
    </a>
  ) : (
    <RouterLink to={link} onClick={onOpen} {...rest}>
      {children}
    </RouterLink>
  );
}

/**
 * Caixa de notificações. O que a tela deve conter está em `README.md`.
 *
 * Dados reais, do plugin de notificações do Backstage (o backend já roda no
 * lab): o scaffolder, por exemplo, notifica quando uma tarefa termina.
 */
export function NotificationsPage() {
  const api = useApi(notificationsApiRef);
  const [view, setView] = useState<View>('unread');
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | NotificationSeverity>('all');
  const [topic, setTopic] = useState('Todos');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [busy, setBusy] = useState<string | null>(null);

  useDebounce(() => setSearch(term.trim()), 300, [term]);
  useEffect(() => setLimit(PAGE_SIZE), [view, search, severity, topic]);

  const { value: status, retry: retryStatus } = useAsyncRetry(() => api.getStatus(), [api]);
  const { value: topics } = useAsync(async () => (await api.getTopics()).topics, [api]);

  const { value, loading, error, retry } = useAsyncRetry(
    () =>
      api.getNotifications({
        limit,
        offset: 0,
        sort: 'created',
        sortOrder: 'desc',
        search: search || undefined,
        read: view === 'unread' ? false : undefined,
        saved: view === 'saved' ? true : undefined,
        minimumSeverity: severity === 'all' ? undefined : severity,
        topic: topic === 'Todos' ? undefined : topic,
      }),
    [api, view, search, severity, topic, limit],
  );

  const notifications = useMemo(() => value?.notifications ?? [], [value]);
  const total = value?.totalCount ?? 0;

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of notifications) {
      const key = dayGroup(new Date(n.created));
      map.set(key, [...(map.get(key) ?? []), n]);
    }
    return [...map.entries()];
  }, [notifications]);

  const refresh = () => {
    retry();
    retryStatus();
    notifyStatusChanged();
  };

  const update = async (ids: string[], change: { read?: boolean; saved?: boolean }) => {
    setBusy(ids.length === 1 ? ids[0] : 'all');
    try {
      await api.updateNotifications({ ids, ...change });
    } finally {
      setBusy(null);
      refresh();
    }
  };

  const markAllRead = async () => {
    // A API marca por id; buscamos todas as não lidas (não só a página atual).
    const unread = await api.getNotifications({ read: false, limit: 1000 });
    const ids = unread.notifications.map(n => n.id);
    if (ids.length) await update(ids, { read: true });
  };

  const unread = status?.unread ?? 0;

  return (
    <AtlasPage
      eyebrow="Caixa de entrada"
      title="Notificações"
      subtitle="Avisos do portal: ofertas que terminaram de executar, aprovações e comunicados."
      actions={
        unread > 0 ? (
          <button type="button" className="atlas-btnPill" onClick={markAllRead} disabled={busy === 'all'}>
            <MarkReadIcon style={{ fontSize: 16 }} /> {busy === 'all' ? 'Marcando…' : 'Marcar todas como lidas'}
          </button>
        ) : undefined
      }
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          <Tabs
            tabs={[
              { id: 'unread', label: `Não lidas${unread ? ` (${unread})` : ''}` },
              { id: 'all', label: 'Todas' },
              { id: 'saved', label: 'Salvas' },
            ]}
            active={view}
            onChange={id => setView(id as View)}
          />
          <div className="atlas-searchFieldWrap" style={{ flex: 1 }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar no título ou na descrição"
              aria-label="Buscar notificações"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="atlas-filtersBar atlas-filtersBarWrap">
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Severidade mínima</span>
            <select
              className="atlas-filterSelect"
              value={severity}
              onChange={e => setSeverity(e.target.value as 'all' | NotificationSeverity)}
            >
              <option value="all">Todas</option>
              {(Object.keys(SEVERITY) as NotificationSeverity[]).map(s => (
                <option key={s} value={s}>{SEVERITY[s].label}</option>
              ))}
            </select>
          </label>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Tópico</span>
            <select className="atlas-filterSelect" value={topic} onChange={e => setTopic(e.target.value)}>
              {['Todos', ...(topics ?? [])].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <ResponseErrorPanel error={error} />
        ) : loading && notifications.length === 0 ? (
          <div className="atlas-notifList">
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="atlas-notifItem" aria-hidden>
                <span className="atlas-notifIcon" />
                <span className="atlas-notifBody">
                  <span className="atlas-skeletonLine" style={{ width: '45%' }} />
                  <span className="atlas-skeletonLine" style={{ width: '80%' }} />
                </span>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="atlas-emptyState">
            {search || severity !== 'all' || topic !== 'Todos' ? (
              'Nenhuma notificação com esses filtros.'
            ) : view === 'unread' ? (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Tudo em dia.</strong>
                <br />
                Nenhuma notificação não lida.
              </>
            ) : view === 'saved' ? (
              'Nenhuma notificação salva. Use o marcador numa notificação para guardá-la aqui.'
            ) : (
              'Nenhuma notificação ainda. Elas chegam, por exemplo, quando uma oferta termina de executar.'
            )}
          </div>
        ) : (
          <>
            {groups.map(([label, items]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="atlas-notifGroupLabel">{label}</div>
                <div className="atlas-notifList">
                  {items.map(n => {
                    const sev = n.payload.severity ?? 'normal';
                    const isRead = Boolean(n.read);
                    const isSaved = Boolean(n.saved);
                    const link = n.payload.link;
                    const title = <>{n.payload.title}</>;
                    return (
                      <article
                        key={n.id}
                        className={`atlas-notifItem atlas-notifSev-${sev} ${isRead ? '' : 'atlas-notifItemUnread'}`}
                      >
                        <span className="atlas-notifIcon" title={`Severidade ${SEVERITY[sev].label.toLowerCase()}`}>
                          {SEVERITY[sev].icon}
                        </span>
                        <div className="atlas-notifBody">
                          <div className="atlas-notifTitle">
                            {!isRead && <span className="atlas-notifUnreadDot" aria-label="Não lida" />}
                            {link ? (
                              <NotificationLink
                                link={link}
                                className="atlas-templateLink"
                                style={{ color: 'inherit' }}
                                onOpen={() => !isRead && update([n.id], { read: true })}
                              >
                                {title}
                              </NotificationLink>
                            ) : (
                              title
                            )}
                          </div>
                          {n.payload.description && (
                            <div className="atlas-notifDesc atlas-clamp2">{n.payload.description}</div>
                          )}
                          <div className="atlas-notifMeta">
                            <span title={new Date(n.created).toLocaleString('pt-BR')}>{when(new Date(n.created))}</span>
                            {n.payload.topic && <span>· {n.payload.topic}</span>}
                            <span>· {n.origin.replace(/^plugin:/, '')}</span>
                          </div>
                        </div>
                        <div className="atlas-notifActions">
                          {link && (
                            <NotificationLink
                              link={link}
                              className="atlas-actionBtnLink"
                              title="Abrir"
                              aria-label={`Abrir ${n.payload.title}`}
                              onOpen={() => !isRead && update([n.id], { read: true })}
                            >
                              <ArrowIcon style={{ fontSize: 16 }} />
                            </NotificationLink>
                          )}
                          <button
                            type="button"
                            className="atlas-actionBtnLink"
                            disabled={busy === n.id}
                            title={isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                            aria-label={isRead ? 'Marcar como não lida' : 'Marcar como lida'}
                            onClick={() => update([n.id], { read: !isRead })}
                          >
                            {isRead ? <MarkUnreadIcon style={{ fontSize: 16 }} /> : <MarkReadIcon style={{ fontSize: 16 }} />}
                          </button>
                          <button
                            type="button"
                            className="atlas-actionBtnLink"
                            disabled={busy === n.id}
                            title={isSaved ? 'Remover das salvas' : 'Salvar'}
                            aria-label={isSaved ? 'Remover das salvas' : 'Salvar'}
                            aria-pressed={isSaved}
                            style={isSaved ? { color: 'var(--lime)' } : undefined}
                            onClick={() => update([n.id], { saved: !isSaved })}
                          >
                            {isSaved ? <BookmarkIcon style={{ fontSize: 16 }} /> : <BookmarkBorderIcon style={{ fontSize: 16 }} />}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="atlas-pagination">
              <span className="atlas-paginationInfo">
                {notifications.length} de {total}
              </span>
              {notifications.length < total && (
                <button type="button" className="atlas-btnPill" disabled={loading} onClick={() => setLimit(l => l + PAGE_SIZE)}>
                  {loading ? 'Carregando…' : 'Carregar mais'}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </AtlasPage>
  );
}
