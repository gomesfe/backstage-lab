import { useCallback, useState } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import {
  Content,
  ContentHeader,
  EmptyState,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
  Table,
  type TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { apiKeysApiRef, type ApiKey } from '../api/ApiKeysClient';
import { CreateKeyDialog } from './CreateKeyDialog';

const STATUS_LABEL: Record<ApiKey['status'], string> = {
  active: 'ativa',
  revoked: 'revogada',
  expired: 'expirada',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR');
}

export function ApiKeysPage() {
  const api = useApi(apiKeysApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const columns: TableColumn<ApiKey>[] = [
    {
      title: 'Prefixo',
      field: 'prefix',
      render: key => <code>{key.prefix}…</code>,
    },
    { title: 'Descrição', field: 'description' },
    { title: 'Dono', field: 'owner' },
    {
      title: 'Status',
      field: 'status',
      render: key => (
        <Chip
          size="small"
          label={STATUS_LABEL[key.status]}
          color={key.status === 'active' ? 'primary' : 'default'}
        />
      ),
    },
    { title: 'Criada em', render: key => formatDate(key.createdAt) },
    {
      title: 'Expira em',
      render: key => (key.expiresAt ? formatDate(key.expiresAt) : 'nunca'),
    },
    {
      title: 'Último uso',
      render: key => (
        <Tooltip
          title={
            key.lastUsedAt
              ? ''
              : 'Nunca usada — candidata a revogação se for antiga'
          }
        >
          <span>{formatDate(key.lastUsedAt)}</span>
        </Tooltip>
      ),
    },
    {
      title: '',
      render: key =>
        key.status === 'active' ? (
          <Button size="small" onClick={() => revoke(key)}>
            Revogar
          </Button>
        ) : null,
    },
  ];

  let body: JSX.Element;
  if (loading) {
    body = <Progress />;
  } else if (error) {
    body = <ResponseErrorPanel error={error} />;
  } else if (!value || value.length === 0) {
    body = (
      <EmptyState
        missing="data"
        title="Nenhuma API key"
        description="API keys dão acesso programático ao portal. Crie uma para usar em pipeline ou script."
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            Criar a primeira
          </Button>
        }
      />
    );
  } else {
    body = (
      <Table
        title={`${value.length} chave(s)`}
        columns={columns}
        data={value}
        options={{ paging: value.length > 20, search: value.length > 5 }}
      />
    );
  }

  return (
    <Page themeId="tool">
      <Header title="Administração" subtitle="API keys do portal" />
      <Content>
        <ContentHeader title="API keys">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Nova chave
          </Button>
        </ContentHeader>
        {body}
        <CreateKeyDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            retry();
          }}
          onCreate={api.create.bind(api)}
        />
      </Content>
    </Page>
  );
}
