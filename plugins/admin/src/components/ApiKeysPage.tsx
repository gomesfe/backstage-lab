import { useCallback, useMemo, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import EyeIcon from '@material-ui/icons/Visibility';
import EyeOffIcon from '@material-ui/icons/VisibilityOff';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  DataTable,
  atlasTokens,
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

const useStyles = makeStyles(theme => ({
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  revoke: {
    background: 'transparent',
    border: 0,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.8rem',
    color: atlasTokens.status.danger,
    '&:disabled': {
      color: theme.palette.text.disabled,
      cursor: 'not-allowed',
    },
  },
}));

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('pt-BR') : '—';
}

export function ApiKeysPage() {
  const classes = useStyles();
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
    { key: 'description', header: 'Nome', render: key => key.description },
    {
      key: 'prefix',
      header: 'Chave',
      render: key => <span className={classes.mono}>{key.prefix}…</span>,
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
          className={classes.revoke}
          disabled={key.status !== 'active'}
          onClick={() => revoke(key)}
        >
          Revogar
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
          <Button
            variant="outlined"
            startIcon={showRevoked ? <EyeOffIcon /> : <EyeIcon />}
            onClick={() => setShowRevoked(v => !v)}
          >
            {showRevoked ? 'Ocultar revogadas' : 'Mostrar revogadas'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Nova chave
          </Button>
        </>
      }
    >
      {loading ? (
        <Progress />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage={
            showRevoked
              ? 'Nenhuma chave emitida ainda.'
              : 'Nenhuma chave ativa. Revogadas e expiradas estão ocultas.'
          }
        />
      )}

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
