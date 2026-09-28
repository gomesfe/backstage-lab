import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { usePermission } from '@backstage/plugin-permission-react';
import {
  Alert,
  AtlasPage,
  Badge,
  DataTable,
  Field,
  Modal,
  Pagination,
  Tabs,
  type BadgeVariant,
  type Column,
} from '@internal/plugin-components';
import { approvalsReviewPermission } from '../_shared/permissions';
import { ENVIRONMENTS, ENV_VARIANT, formatDateTime } from '../_shared/environments';
import { loadApprovals, type ApprovalItem, type ApprovalStatus } from './approvalsData';

type View = 'approver' | 'requester';
type StatusFilter = 'pending' | 'running' | 'history' | 'all';

const STATUS: Record<ApprovalStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'aguardando aprovação', variant: 'warning' },
  running: { label: 'em execução', variant: 'info' },
  done: { label: 'concluído', variant: 'lime' },
  rejected: { label: 'rejeitado', variant: 'danger' },
  cancelled: { label: 'cancelado', variant: 'purple' },
  failed: { label: 'falhou', variant: 'danger' },
};

const HISTORY: ApprovalStatus[] = ['done', 'rejected', 'cancelled', 'failed'];

const inFilter = (status: ApprovalStatus, filter: StatusFilter) =>
  filter === 'all' ||
  (filter === 'pending' && status === 'pending') ||
  (filter === 'running' && status === 'running') ||
  (filter === 'history' && HISTORY.includes(status));

type Dialog = { item: ApprovalItem; mode: 'details' | 'approve' | 'reject' | 'cancel' } | null;

const PAGE_SIZE = 10;

/**
 * Aprovações e solicitações numa tela só. O que ela deve conter está em
 * `README.md`.
 *
 * "Minhas aprovações" só aparece para quem tem `atlas.approvals.review` no
 * RBAC; quem não tem vê direto "Minhas solicitações". É a mesma tabela — o
 * que muda é de que lado do pedido você está.
 */
export function ApprovalsPage() {
  const { allowed: canReview, loading: permissionLoading } = usePermission({
    permission: approvalsReviewPermission,
  });

  const { value: loaded, loading } = useAsync(loadApprovals, []);
  const [items, setItems] = useState<ApprovalItem[]>([]);
  useEffect(() => setItems(loaded ?? []), [loaded]);

  const [view, setView] = useState<View>('approver');
  const effectiveView: View = canReview ? view : 'requester';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [query, setQuery] = useState('');
  const [environment, setEnvironment] = useState('Todos');
  const [group, setGroup] = useState('Todos');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [note, setNote] = useState('');

  const ofView = useMemo(() => items.filter(i => i.side === effectiveView), [items, effectiveView]);
  const groups = useMemo(() => [...new Set(ofView.map(i => i.group))].sort(), [ofView]);

  const counts = useMemo(
    () => ({
      pending: ofView.filter(i => i.status === 'pending').length,
      running: ofView.filter(i => i.status === 'running').length,
      done: ofView.filter(i => i.status === 'done').length,
      history: ofView.filter(i => HISTORY.includes(i.status)).length,
    }),
    [ofView],
  );
  const pendingApprovals = items.filter(i => i.side === 'approver' && i.status === 'pending').length;

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ofView
      .filter(i => inFilter(i.status, statusFilter))
      .filter(i => environment === 'Todos' || i.environment === environment)
      .filter(i => group === 'Todos' || i.group === group)
      .filter(i => !term || `${i.resource} ${i.requester} ${i.template}`.toLowerCase().includes(term))
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  }, [ofView, statusFilter, environment, group, query]);

  useEffect(() => setPage(1), [effectiveView, statusFilter, environment, group, query]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (id: string, change: (i: ApprovalItem) => ApprovalItem) =>
    setItems(current => current.map(i => (i.id === id ? change(i) : i)));

  const confirm = () => {
    if (!dialog) return;
    const { item, mode } = dialog;
    if (mode === 'approve') {
      update(item.id, i => {
        const done = i.approvals.done + 1;
        return {
          ...i,
          approvals: { ...i.approvals, done },
          approvedBy: [...i.approvedBy, 'você'],
          // Última aprovação que faltava: a solicitação segue para execução.
          status: done >= i.approvals.required ? 'running' : 'pending',
        };
      });
    }
    if (mode === 'reject') update(item.id, i => ({ ...i, status: 'rejected', closingNote: note.trim() }));
    if (mode === 'cancel') update(item.id, i => ({ ...i, status: 'cancelled', closingNote: note.trim() || undefined }));
    setDialog(null);
    setNote('');
  };

  const columns: Column<ApprovalItem>[] = [
    {
      key: 'resource',
      header: 'Recurso',
      render: i => (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="atlas-resourceCell">{i.resource}</span>
          <span className="atlas-paginationInfo">{i.template}</span>
        </span>
      ),
    },
    { key: 'environment', header: 'Ambiente', render: i => <Badge variant={ENV_VARIANT[i.environment]}>{i.environment}</Badge> },
    { key: 'group', header: 'Grupo', render: i => i.group },
    { key: 'owner', header: 'Dono', render: i => i.owner },
    { key: 'requester', header: 'Solicitante', render: i => i.requester },
    { key: 'requestedAt', header: 'Data da solicitação', render: i => formatDateTime(i.requestedAt) },
    {
      key: 'approvals',
      header: 'Aprovações',
      render: i => (
        <span title={i.approvedBy.length ? `Aprovado por ${i.approvedBy.join(', ')}` : 'Ninguém aprovou ainda'}>
          {i.approvals.done} de {i.approvals.required}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: i => <Badge variant={STATUS[i.status].variant}>{STATUS[i.status].label}</Badge> },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: i => (
        <span className="atlas-tableActionGroup" style={{ justifyContent: 'flex-end' }}>
          {effectiveView === 'approver' && i.status === 'pending' && !i.approvedBy.includes('você') && (
            <>
              <button type="button" className="atlas-btnPill atlas-btnPillLime" onClick={() => setDialog({ item: i, mode: 'approve' })}>
                Aprovar
              </button>
              <button type="button" className="atlas-actionBtnLink atlas-actionBtnDanger" onClick={() => setDialog({ item: i, mode: 'reject' })}>
                Rejeitar
              </button>
            </>
          )}
          {effectiveView === 'requester' && i.status === 'pending' && (
            <button type="button" className="atlas-actionBtnLink atlas-actionBtnDanger" onClick={() => setDialog({ item: i, mode: 'cancel' })}>
              Cancelar
            </button>
          )}
          <button type="button" className="atlas-actionBtnLink" onClick={() => setDialog({ item: i, mode: 'details' })}>
            Detalhes
          </button>
        </span>
      ),
    },
  ];

  const stat = (title: string, value: number, sub: string, filter: StatusFilter) => (
    <button
      type="button"
      className="atlas-expandMetricCard"
      style={{ textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', ...(statusFilter === filter ? { borderColor: 'var(--lime-border)' } : {}) }}
      aria-pressed={statusFilter === filter}
      onClick={() => setStatusFilter(filter)}
    >
      <div className="atlas-metricCardHead">
        <span className="atlas-metricCardTitle">{title}</span>
      </div>
      <div className="atlas-metricBigValue">{loading ? '—' : value}</div>
      <div className="atlas-metricCardSub">{sub}</div>
    </button>
  );

  const d = dialog?.item;

  return (
    <AtlasPage
      eyebrow="Governança"
      title="Aprovações"
      subtitle={
        canReview
          ? 'Aprove o que pedem para você e acompanhe o que você pediu.'
          : 'Acompanhe as solicitações de provisionamento que você fez.'
      }
    >
      <Alert variant="info" title="Dados de exemplo">
        O lab ainda não tem o serviço de aprovações. As solicitações abaixo são exemplos, e aprovar,
        rejeitar ou cancelar muda só esta sessão.
      </Alert>

      <div className="atlas-topOverviewCardsGrid">
        {stat('Aguardando aprovação', counts.pending, effectiveView === 'approver' ? 'esperando a sua decisão' : 'esperando aprovadores', 'pending')}
        {stat('Em execução', counts.running, 'aprovadas, sendo provisionadas', 'running')}
        {stat('Concluídos', counts.done, `${counts.history} no histórico, com rejeitados e cancelados`, 'history')}
      </div>

      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          {!permissionLoading && canReview && (
            <Tabs
              tabs={[
                { id: 'approver', label: `Minhas aprovações${pendingApprovals ? ` (${pendingApprovals})` : ''}` },
                { id: 'requester', label: 'Minhas solicitações' },
              ]}
              active={effectiveView}
              onChange={id => setView(id as View)}
            />
          )}
          <div className="atlas-searchFieldWrap" style={{ flex: 1 }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar por recurso ou solicitante"
              aria-label="Buscar por recurso ou solicitante"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="atlas-filtersBar atlas-filtersBarWrap">
          <Tabs
            tabs={[
              { id: 'pending', label: `Pendentes (${counts.pending})` },
              { id: 'running', label: `Em execução (${counts.running})` },
              { id: 'history', label: `Histórico (${counts.history})` },
              { id: 'all', label: 'Todos' },
            ]}
            active={statusFilter}
            onChange={id => setStatusFilter(id as StatusFilter)}
          />
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label className="atlas-labeledSelect">
              <span className="atlas-labeledSelectLabel">Ambiente</span>
              <select className="atlas-filterSelect" value={environment} onChange={e => setEnvironment(e.target.value)}>
                {['Todos', ...ENVIRONMENTS].map(env => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </label>
            <label className="atlas-labeledSelect">
              <span className="atlas-labeledSelectLabel">Grupo</span>
              <select className="atlas-filterSelect" value={group} onChange={e => setGroup(e.target.value)}>
                {['Todos', ...groups].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={pageRows}
          loading={loading}
          emptyMessage={
            statusFilter === 'pending' && effectiveView === 'approver'
              ? 'Nada esperando a sua aprovação.'
              : 'Nenhuma solicitação com esses filtros.'
          }
        />
        {!loading && rows.length > 0 && (
          <Pagination page={page} pageCount={pageCount} onChange={setPage} info={`${rows.length} ${rows.length === 1 ? 'solicitação' : 'solicitações'}`} />
        )}
      </section>

      <Modal
        open={Boolean(dialog)}
        onClose={() => {
          setDialog(null);
          setNote('');
        }}
        title={
          dialog?.mode === 'approve' ? 'Aprovar solicitação'
            : dialog?.mode === 'reject' ? 'Rejeitar solicitação'
            : dialog?.mode === 'cancel' ? 'Cancelar solicitação'
            : 'Detalhes da solicitação'
        }
        footer={
          dialog?.mode === 'details' ? (
            <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Fechar</button>
          ) : (
            <>
              <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Voltar</button>
              <button
                type="button"
                className={`atlas-btnPill ${dialog?.mode === 'approve' ? 'atlas-btnPillLime' : ''}`}
                style={dialog?.mode === 'approve' ? undefined : { color: 'var(--danger)', borderColor: 'rgba(255, 82, 82, 0.4)' }}
                disabled={dialog?.mode === 'reject' && note.trim().length < 5}
                onClick={confirm}
              >
                {dialog?.mode === 'approve' ? 'Aprovar' : dialog?.mode === 'reject' ? 'Rejeitar' : 'Cancelar solicitação'}
              </button>
            </>
          )
        }
      >
        {d && (
          <>
            <div className="atlas-readonlyGrid">
              {[
                ['Recurso', d.resource],
                ['Oferta', d.template],
                ['Ambiente', d.environment],
                ['Grupo', d.group],
                ['Dono', d.owner],
                ['Solicitante', d.requester],
                ['Solicitado em', formatDateTime(d.requestedAt)],
                ['Aprovações', `${d.approvals.done} de ${d.approvals.required}${d.approvedBy.length ? ` (${d.approvedBy.join(', ')})` : ''}`],
              ].map(([label, value]) => (
                <div key={label} className="atlas-field">
                  <span className="atlas-fieldLabel">{label}</span>
                  <span className="atlas-readonlyValue">{value}</span>
                </div>
              ))}
            </div>
            <div className="atlas-field">
              <span className="atlas-fieldLabel">Justificativa</span>
              <span className="atlas-readonlyValue">{d.justification}</span>
            </div>
            {d.closingNote && (
              <Alert variant={d.status === 'cancelled' ? 'info' : 'danger'} title={STATUS[d.status].label}>
                {d.closingNote}
              </Alert>
            )}
            {dialog?.mode === 'approve' && d.environment.startsWith('pr') && (
              <Alert variant="warning" title="Ambiente de produção">
                Depois da última aprovação, o provisionamento começa sozinho.
              </Alert>
            )}
            {(dialog?.mode === 'reject' || dialog?.mode === 'cancel') && (
              <Field
                label={dialog.mode === 'reject' ? 'Motivo da rejeição' : 'Motivo (opcional)'}
                hint={dialog.mode === 'reject' ? 'Vai para quem pediu. Mínimo de 5 caracteres.' : undefined}
              >
                <textarea className="atlas-textarea" value={note} onChange={e => setNote(e.target.value)} />
              </Field>
            )}
          </>
        )}
      </Modal>
    </AtlasPage>
  );
}
