import { useCallback, useMemo, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import EyeIcon from '@material-ui/icons/Visibility';
import EyeOffIcon from '@material-ui/icons/VisibilityOff';
import AddIcon from '@material-ui/icons/Add';
import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  DataTable,
  Pill,
  type Column,
} from '@internal/plugin-components';
import { apiKeysApiRef, type ApiKey } from '../api/ApiKeysClient';
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

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('pt-BR') : '—';
}

/**
 * Gerência de API keys, portada de `ApiKeysPage.tsx` do redesign — usando as
 * classes do design system (tabela, badges, pílulas) em vez de estilos
 * próprios.
 */
export function ApiKeysPage() {
  const api = useApi(apiKeysApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showRevoked, setShowRevoked] = useState(false);

  const { value, loading, error, retry } = useAsyncRetry(
    () => api.list(),
    [api],
  );

  const revoke = useCallback(
    async (key: ApiKey) => {
      await api.revoke(key.id);
      retry();
    },
    [api, retry],
  );

  const rows = useMemo(
    () =>
      (value ?? []).filter(key => showRevoked || key.status === 'active'),
    [value, showRevoked],
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
      render: key => (
        <Badge variant={STATUS_VARIANT[key.status]}>
          {STATUS_LABEL[key.status]}
        </Badge>
      ),
    },
    { key: 'owner', header: 'Dono', render: key => key.owner },
    {
      key: 'createdAt',
      header: 'Criada em',
      render: key => formatDate(key.createdAt),
    },
    {
      key: 'expiresAt',
      header: 'Expira em',
      render: key => (key.expiresAt ? formatDate(key.expiresAt) : 'nunca'),
    },
    {
      key: 'lastUsedAt',
      header: 'Último uso',
      render: key => formatDate(key.lastUsedAt),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: key => (
        <button
          type="button"
          className="atlas-actionBtnLink"
          style={
            key.status === 'active'
              ? { color: 'var(--danger)' }
              : { color: 'var(--text-muted)' }
          }
          disabled={key.status !== 'active'}
          onClick={() => revoke(key)}
        >
          Revoke
        </button>
      ),
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Credenciais"
      title="API Keys"
      subtitle="Crie e gerencie chaves de API para integrações e automações do seu squad."
      actions={
        <>
          <Pill onClick={() => setShowRevoked(v => !v)}>
            {showRevoked ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}{' '}
            {showRevoked ? 'Ocultar revogadas' : 'Mostrar revogadas'}
          </Pill>
          <Pill lime onClick={() => setDialogOpen(true)}>
            <AddIcon fontSize="small" /> Nova chave
          </Pill>
        </>
      }
    >
      <section className="atlas-tableContainerCard">
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyMessage={
            showRevoked
              ? 'Nenhuma chave emitida ainda.'
              : 'Nenhuma chave ativa. Revogadas e expiradas estão ocultas.'
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
