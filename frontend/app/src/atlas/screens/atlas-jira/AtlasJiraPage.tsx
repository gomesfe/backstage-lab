import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import SyncIcon from '@material-ui/icons/Sync';
import DraftIcon from '@material-ui/icons/Drafts';
import CardIcon from '@material-ui/icons/ViewAgenda';
import {
  Alert,
  AtlasPage,
  Badge,
  DataTable,
  Modal,
  type BadgeVariant,
  type Column,
} from '../../components';
import { formatDateTime } from '../_shared/environments';
import { loadJira, syncFromGitHub, type Draft, type IssueType, type JiraCard } from './jiraData';

type Section = 'drafts' | 'cards';

const TYPE_VARIANT: Record<IssueType, BadgeVariant> = {
  Bug: 'danger',
  Melhoria: 'lime',
  Tarefa: 'info',
  Dúvida: 'purple',
};

const STATUS_VARIANT: Record<JiraCard['status'], BadgeVariant> = {
  'A fazer': 'info',
  'Em andamento': 'warning',
  'Em revisão': 'purple',
};

type Dialog = { mode: 'create' | 'discard' | 'draft'; draft: Draft } | { mode: 'card'; card: JiraCard } | null;

/**
 * Atlas × Jira. O que a tela deve conter está em `README.md`.
 */
export function AtlasJiraPage() {
  const { value, loading } = useAsync(loadJira, []);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [cards, setCards] = useState<JiraCard[]>([]);
  useEffect(() => {
    setDrafts(value?.drafts ?? []);
    setCards(value?.cards ?? []);
  }, [value]);

  const [section, setSection] = useState<Section>('drafts');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('Todos');
  const [syncing, setSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);

  const sync = async () => {
    setSyncing(true);
    try {
      const fresh = await syncFromGitHub();
      // Rascunho que já virou card não volta a aparecer.
      const promoted = new Set(cards.map(c => c.origin));
      setDrafts(fresh.drafts.filter(d => !promoted.has(d.origin)));
      setSyncedAt(new Date().toISOString());
    } finally {
      setSyncing(false);
    }
  };

  const term = query.trim().toLowerCase();
  const draftRows = useMemo(
    () =>
      drafts
        .filter(d => type === 'Todos' || d.type === type)
        .filter(d => !term || `${d.title} ${d.origin} ${d.requester}`.toLowerCase().includes(term))
        .sort((a, b) => b.importedAt.localeCompare(a.importedAt)),
    [drafts, type, term],
  );
  const cardRows = useMemo(
    () =>
      cards
        .filter(c => type === 'Todos' || c.type === type)
        .filter(c => !term || `${c.key} ${c.title} ${c.assignee}`.toLowerCase().includes(term))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [cards, type, term],
  );

  const createCard = (draft: Draft) => {
    const next = Math.max(0, ...cards.map(c => Number(c.key.split('-')[1]))) + 1;
    setCards(current => [
      { key: `ATLAS-${next}`, title: draft.title, type: draft.type, status: 'A fazer', assignee: 'sem responsável', createdAt: new Date().toISOString(), origin: draft.origin },
      ...current,
    ]);
    setDrafts(current => current.filter(d => d.id !== draft.id));
  };

  const confirm = () => {
    if (dialog?.mode === 'create') createCard(dialog.draft);
    if (dialog?.mode === 'discard') setDrafts(current => current.filter(d => d.id !== dialog.draft.id));
    setDialog(null);
  };

  const draftColumns: Column<Draft>[] = [
    { key: 'origin', header: 'Origem', render: d => <span className="atlas-costMono">{d.origin}</span> },
    { key: 'requester', header: 'Solicitante da execução', render: d => d.requester },
    {
      key: 'title',
      header: 'Título',
      render: d => (
        <button type="button" className="atlas-templateLink" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', textAlign: 'left' }} onClick={() => setDialog({ mode: 'draft', draft: d })}>
          {d.title}
        </button>
      ),
    },
    { key: 'type', header: 'Tipo', render: d => <Badge variant={TYPE_VARIANT[d.type]}>{d.type}</Badge> },
    { key: 'importedAt', header: 'Data de importação', render: d => formatDateTime(d.importedAt) },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      render: d => (
        <span className="atlas-tableActionGroup" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="atlas-btnPill atlas-btnPillLime" onClick={() => setDialog({ mode: 'create', draft: d })}>
            Criar card
          </button>
          <button type="button" className="atlas-actionBtnLink atlas-actionBtnDanger" onClick={() => setDialog({ mode: 'discard', draft: d })}>
            Descartar
          </button>
        </span>
      ),
    },
  ];

  const cardColumns: Column<JiraCard>[] = [
    { key: 'key', header: 'Card', render: c => <span className="atlas-costMono" style={{ color: 'var(--text-primary)' }}>{c.key}</span> },
    { key: 'title', header: 'Título', render: c => <span className="atlas-resourceCell">{c.title}</span> },
    { key: 'type', header: 'Tipo', render: c => <Badge variant={TYPE_VARIANT[c.type]}>{c.type}</Badge> },
    { key: 'status', header: 'Status', render: c => <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge> },
    { key: 'assignee', header: 'Responsável', render: c => c.assignee },
    { key: 'origin', header: 'Origem', render: c => <span className="atlas-costMono">{c.origin}</span> },
    { key: 'createdAt', header: 'Criado em', render: c => formatDateTime(c.createdAt) },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      render: c => (
        <button type="button" className="atlas-actionBtnLink" onClick={() => setDialog({ mode: 'card', card: c })}>
          Detalhes
        </button>
      ),
    },
  ];

  return (
    <AtlasPage
      eyebrow="Integrações"
      title="Atlas × Jira"
      subtitle="Issues do GitHub chegam como rascunho; daqui viram cards no Jira."
      actions={
        <button type="button" className="atlas-btnPill" onClick={sync} disabled={syncing || loading}>
          <SyncIcon style={{ fontSize: 16 }} /> {syncing ? 'Sincronizando…' : 'Sincronizar com GitHub'}
        </button>
      }
    >
      <Alert variant="info" title="Dados de exemplo">
        O lab ainda não tem a integração com GitHub e Jira. Os itens abaixo são exemplos; criar card,
        descartar e sincronizar mudam só esta sessão.
        {syncedAt && ` Última sincronização: ${formatDateTime(syncedAt)}.`}
      </Alert>

      <div className="atlas-sideLayout">
        <nav className="atlas-sectionCard atlas-sideMenu" aria-label="Seções" style={{ padding: 10 }}>
          {([
            { id: 'drafts', label: 'Rascunhos', icon: <DraftIcon fontSize="small" />, count: drafts.length },
            { id: 'cards', label: 'Cards abertos', icon: <CardIcon fontSize="small" />, count: cards.length },
          ] as const).map(item => (
            <button
              key={item.id}
              type="button"
              aria-current={section === item.id ? 'page' : undefined}
              className={`atlas-sidebarItem ${section === item.id ? 'atlas-sidebarItemActive' : ''}`}
              onClick={() => setSection(item.id)}
            >
              {item.icon}
              {item.label}
              <span className="atlas-sidebarBadge atlas-groupHeadingCount">{loading ? '—' : item.count}</span>
            </button>
          ))}
        </nav>

        <section className="atlas-tableContainerCard">
          <div className="atlas-filtersBar">
            <div className="atlas-searchFieldWrap" style={{ flex: 1 }}>
              <input
                className="atlas-filterInput"
                placeholder={section === 'drafts' ? 'Buscar por título, origem ou solicitante' : 'Buscar por card, título ou responsável'}
                aria-label="Buscar"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <label className="atlas-labeledSelect">
              <span className="atlas-labeledSelectLabel">Tipo</span>
              <select className="atlas-filterSelect" value={type} onChange={e => setType(e.target.value)}>
                {['Todos', 'Bug', 'Melhoria', 'Tarefa', 'Dúvida'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>

          {section === 'drafts' ? (
            <DataTable
              columns={draftColumns}
              rows={draftRows}
              loading={loading || syncing}
              emptyMessage={drafts.length ? 'Nenhum rascunho com esses filtros.' : 'Nenhum rascunho. Sincronize com o GitHub para importar issues novas.'}
            />
          ) : (
            <DataTable
              columns={cardColumns}
              rows={cardRows.map(c => ({ ...c, id: c.key }))}
              loading={loading}
              emptyMessage="Nenhum card aberto com esses filtros."
            />
          )}
        </section>
      </div>

      <Modal
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        wide={dialog?.mode === 'draft'}
        title={
          dialog?.mode === 'create' ? 'Criar card no Jira'
            : dialog?.mode === 'discard' ? 'Descartar rascunho'
            : dialog?.mode === 'card' ? dialog.card.key
            : dialog?.mode === 'draft' ? dialog.draft.title
            : ''
        }
        footer={
          dialog?.mode === 'create' || dialog?.mode === 'discard' ? (
            <>
              <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Voltar</button>
              <button
                type="button"
                className={`atlas-btnPill ${dialog.mode === 'create' ? 'atlas-btnPillLime' : ''}`}
                style={dialog.mode === 'discard' ? { color: 'var(--danger)', borderColor: 'rgba(255, 82, 82, 0.4)' } : undefined}
                onClick={confirm}
              >
                {dialog.mode === 'create' ? 'Criar card' : 'Descartar'}
              </button>
            </>
          ) : dialog?.mode === 'draft' ? (
            <>
              <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Fechar</button>
              <button type="button" className="atlas-btnPill atlas-btnPillLime" onClick={() => setDialog({ mode: 'create', draft: dialog.draft })}>
                Criar card
              </button>
            </>
          ) : (
            <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Fechar</button>
          )
        }
      >
        {dialog && dialog.mode !== 'card' && (
          <>
            {dialog.mode !== 'draft' && <p className="atlas-text"><strong>{dialog.draft.title}</strong></p>}
            <div className="atlas-readonlyGrid">
              {[
                ['Origem', dialog.draft.origin],
                ['Solicitante da execução', dialog.draft.requester],
                ['Tipo', dialog.draft.type],
                ['Importado em', formatDateTime(dialog.draft.importedAt)],
              ].map(([label, v]) => (
                <div key={label} className="atlas-field">
                  <span className="atlas-fieldLabel">{label}</span>
                  <span className="atlas-readonlyValue">{v}</span>
                </div>
              ))}
            </div>
            <div className="atlas-field">
              <span className="atlas-fieldLabel">Descrição da issue</span>
              <span className="atlas-readonlyValue">{dialog.draft.body}</span>
            </div>
            {dialog.mode === 'create' && (
              <p className="atlas-text">O card nasce em “A fazer”, sem responsável, com link para a issue de origem.</p>
            )}
            {dialog.mode === 'discard' && (
              <Alert variant="warning" title="A issue continua no GitHub">
                Descartar só tira o rascunho daqui. Se a issue for atualizada, ela volta na próxima sincronização.
              </Alert>
            )}
          </>
        )}
        {dialog?.mode === 'card' && (
          <div className="atlas-readonlyGrid">
            {[
              ['Título', dialog.card.title],
              ['Tipo', dialog.card.type],
              ['Status', dialog.card.status],
              ['Responsável', dialog.card.assignee],
              ['Origem', dialog.card.origin],
              ['Criado em', formatDateTime(dialog.card.createdAt)],
            ].map(([label, v]) => (
              <div key={label} className="atlas-field">
                <span className="atlas-fieldLabel">{label}</span>
                <span className="atlas-readonlyValue">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AtlasPage>
  );
}
