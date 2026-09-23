import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ShieldIcon from '@material-ui/icons/VerifiedUser';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  DataTable,
  atlasTokens,
  type Column,
} from '@internal/plugin-components';
import { apiKeysApiRef } from '../api/ApiKeysClient';

const { radius } = atlasTokens;

type UserWithKeys = {
  id: string;
  user: string;
  activeKeys: number;
  totalKeys: number;
  lastUsage: string;
};

const useStyles = makeStyles(theme => ({
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '8px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: theme.palette.text.primary,
  },
  missing: {
    padding: '28px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    color: theme.palette.text.secondary,
    fontSize: '0.86rem',
    lineHeight: 1.6,
  },
  missingTitle: {
    fontWeight: 800,
    color: theme.palette.text.primary,
    fontSize: '0.95rem',
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.8rem',
  },
}));

/**
 * Painel administrativo.
 *
 * Das três abas do redesign, só "usuários com chaves" tem fonte de dados no
 * lab — ela é derivada das próprias API keys. As outras duas dependem de um
 * log de auditoria que não existe, e dizem isso em vez de mostrar número
 * inventado: um painel de administração que mente é pior que um vazio.
 */
export function AdminPage() {
  const classes = useStyles();
  const api = useApi(apiKeysApiRef);
  const [tab, setTab] = useState(0);

  const { value, loading, error } = useAsync(() => api.list(), [api]);

  const users: UserWithKeys[] = useMemo(() => {
    const byOwner = new Map<string, UserWithKeys>();

    for (const key of value ?? []) {
      const current = byOwner.get(key.owner) ?? {
        id: key.owner,
        user: key.owner,
        activeKeys: 0,
        totalKeys: 0,
        lastUsage: '—',
      };

      current.totalKeys += 1;
      if (key.status === 'active') current.activeKeys += 1;

      if (key.lastUsedAt) {
        const stamp = new Date(key.lastUsedAt).toLocaleString('pt-BR');
        if (current.lastUsage === '—' || stamp > current.lastUsage) {
          current.lastUsage = stamp;
        }
      }

      byOwner.set(key.owner, current);
    }

    return [...byOwner.values()].sort((a, b) => b.activeKeys - a.activeKeys);
  }, [value]);

  const userColumns: Column<UserWithKeys>[] = [
    {
      key: 'user',
      header: 'Usuário',
      render: row => <span className={classes.mono}>{row.user}</span>,
    },
    {
      key: 'activeKeys',
      header: 'Chaves ativas',
      align: 'right',
      render: row => row.activeKeys,
    },
    {
      key: 'totalKeys',
      header: 'Total emitido',
      align: 'right',
      render: row => row.totalKeys,
    },
    { key: 'lastUsage', header: 'Último uso', render: row => row.lastUsage },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Administração"
      title="Administração"
      subtitle="Uso do portal, atividade das chaves de API e usuários com credenciais ativas."
      actions={<Badge variant="purple">acesso admin</Badge>}
    >
      <section className={classes.card}>
        <div className={classes.header}>
          <h3 className={classes.title}>
            <ShieldIcon fontSize="small" /> Painel administrativo
          </h3>
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Usuários com chaves" />
            <Tab label="Uso do portal" />
            <Tab label="Uso da API" />
          </Tabs>
        </div>

        {tab === 0 &&
          (loading ? (
            <Progress />
          ) : (
            <DataTable
              columns={userColumns}
              rows={users}
              emptyMessage="Nenhum usuário emitiu chaves ainda."
            />
          ))}

        {tab === 1 && (
          <div className={classes.missing}>
            <span className={classes.missingTitle}>
              Sem log de acessos no lab
            </span>
            <span>
              Esta aba mostraria quem acessou o portal e quando. O lab não
              registra acessos: o backend loga requisições no console, mas nada
              é persistido nem consultável.
            </span>
            <span>
              O que faltaria: um plugin de auditoria que grave usuário, rota e
              horário numa tabela própria, com retenção definida — dado de
              acesso é dado pessoal e não pode ficar guardado para sempre sem
              critério.
            </span>
          </div>
        )}

        {tab === 2 && (
          <div className={classes.missing}>
            <span className={classes.missingTitle}>
              Sem log de requisições no lab
            </span>
            <span>
              Esta aba mostraria cada chamada autenticada por chave: horário,
              método, rota e corpo. Hoje o plugin de API keys grava apenas o
              carimbo do último uso de cada chave — o suficiente para achar
              chave esquecida, não para auditar chamadas.
            </span>
            <span>
              O que faltaria: registrar cada validação de chave numa tabela de
              uso. É a mudança menor das duas, porque o ponto de captura já
              existe em <span className={classes.mono}>ApiKeyStore.validate</span>.
            </span>
          </div>
        )}
      </section>
    </AtlasPage>
  );
}
