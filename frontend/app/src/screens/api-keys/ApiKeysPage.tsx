import { useCallback, useMemo, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import AddIcon from '@material-ui/icons/Add';
import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  DataTable,
  Pill,
  Tabs,
  type Column,
} from '@internal/plugin-components';
import { apiKeysApiRef, type ApiKey } from './ApiKeysClient';
import { CreateKeyDialog } from './CreateKeyDialog';

const STATUS_LABEL: Record<ApiKey['status'], string> = {
  active: 'ativa',
  revoked: 'revogada',
  expired: 'expirada',
};

const STATUS_VARIANT: Record<ApiKey['status'], 'lime' | 'danger' | 'warning'> = {
  active: 'lime',
  revoked: 'danger',
  expired: 'warning',
};

const WEEK = 7 * 24 * 60 * 60 * 1000;

function formatDate(value: string | null): string {
  return value
    ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : '—';
}

const expiresSoon = (key: ApiKey) =>
  key.status === 'active' &&
  key.expiresAt !== null &&
  new Date(key.expiresAt).getTime() - Date.now() < WEEK;

/**
 * Chaves de API do usuário. O que a tela deve conter está em `README.md`.
 */
export function ApiKeysPage() {
  const api = useApi(apiKeysApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState<'active' | 'all'>('active');
  // Revogar é irreversível: o primeiro clique pede confirmação na própria linha.
  const [confirming, setConfirming] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const { value, loading, error, retry } = useAsyncRetry(() => api.list(), [api]);
  const keys = useMemo(() => value ?? [], [value]);

  const revoke = useCallback(
    async (key: ApiKey) => {
      setRevoking(key.id);
      try {
        await api.revoke(key.id);
      } finally {
        setRevoking(null);
        setConfirming(null);
        retry();
      }
    },
    [api, retry],
  );

  const stats = useMemo(
    () => ({
      active: keys.filter(k => k.status === 'active').length,
      soon: keys.filter(expiresSoon).length,
      inactive: keys.filter(k => k.status !== 'active').length,
    }),
    [keys],
  );

  const rows = useMemo(
    () => keys.filter(key => tab === 'all' || key.status === 'active'),
    [keys, tab],
  );

  const columns: Column<ApiKey>[] = [
    {
      key: 'description',
      header: 'Nome',
      render: key => <span className="atlas-resourceCell">{key.description}</span>,
    },
    {
      key: 'prefix',
      header: 'Chave',
      render: key => <span className="atlas-costMono">{key.prefix}…</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: key =>
        expiresSoon(key) ? (
          <Badge variant="warning">expira em breve</Badge>
        ) : (
          <Badge variant={STATUS_VARIANT[key.status]}>{STATUS_LABEL[key.status]}</Badge>
        ),
    },
    { key: 'owner', header: 'Dono', render: key => key.owner },
    { key: 'createdAt', header: 'Criada em', render: key => formatDate(key.createdAt) },
    {
      key: 'expiresAt',
      header: 'Expira em',
      render: key => (key.expiresAt ? formatDate(key.expiresAt) : 'nunca'),
    },
    {
      key: 'lastUsedAt',
      header: 'Último uso',
      render: key => (key.lastUsedAt ? formatDate(key.lastUsedAt) : 'nunca usada'),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: key => {
        if (key.status !== 'active') return <span className="atlas-paginationInfo">—</span>;
        if (confirming === key.id) {
          return (
            <span className="atlas-tableActionGroup" style={{ justifyContent: 'flex-end' }}>
              <span className="atlas-paginationInfo">Revogar?</span>
              <button
                type="button"
                className="atlas-actionBtnLink"
                style={{ color: 'var(--danger)' }}
                disabled={revoking === key.id}
                onClick={() => revoke(key)}
              >
                {revoking === key.id ? 'Revogando…' : 'Sim, revogar'}
              </button>
              <button type="button" className="atlas-actionBtnLink" onClick={() => setConfirming(null)}>
                Cancelar
              </button>
            </span>
          );
        }
        return (
          <button
            type="button"
            className="atlas-actionBtnLink"
            style={{ color: 'var(--danger)' }}
            onClick={() => setConfirming(key.id)}
          >
            Revogar
          </button>
        );
      },
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Credenciais"
      title="API Keys"
      subtitle="Crie e gerencie chaves de API para integrações e automações do seu squad."
      actions={
        <Pill lime onClick={() => setDialogOpen(true)}>
          <AddIcon fontSize="small" /> Nova chave
        </Pill>
      }
    >
      <div className="atlas-topOverviewCardsGrid">
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Ativas</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.active}</div>
          <div className="atlas-metricCardSub">podem autenticar agora</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Expiram em 7 dias</span></div>
          <div className="atlas-metricBigValue" style={stats.soon ? { color: 'var(--warning)' } : undefined}>
            {loading ? '—' : stats.soon}
          </div>
          <div className="atlas-metricCardSub">emita a substituta antes de a automação parar</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Revogadas ou expiradas</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.inactive}</div>
          <div className="atlas-metricCardSub">mantidas no histórico</div>
        </div>
      </div>

      <section className="atlas-tableContainerCard">
        <div className="atlas-sectionCardHeader">
          <Tabs
            tabs={[
              { id: 'active', label: `Ativas (${stats.active})` },
              { id: 'all', label: `Todas (${keys.length})` },
            ]}
            active={tab}
            onChange={id => setTab(id as 'active' | 'all')}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyMessage={
            keys.length === 0
              ? 'Nenhuma chave emitida ainda. Use “Nova chave” para criar a primeira.'
              : 'Nenhuma chave ativa. Veja o histórico em “Todas”.'
          }
        />
      </section>

      <CreateKeyDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          retry();
        }}
        onCreate={api.create.bind(api)}
      />
    </AtlasPage>
  );
}
