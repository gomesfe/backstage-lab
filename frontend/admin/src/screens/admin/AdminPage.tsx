import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import ShieldIcon from '@material-ui/icons/SupervisorAccount';
import { ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  AtlasPage,
  Badge,
  DataTable,
  Tabs,
  type Column,
} from '@internal/plugin-components';
import { apiKeysApiRef } from '../../api/ApiKeysClient';

type UserWithKeys = {
  id: string;
  user: string;
  activeKeys: number;
  totalKeys: number;
  /** Epoch em ms; comparar datas formatadas como texto ordena errado. */
  lastUsedMs: number | null;
};

const MONTH = 30 * 24 * 60 * 60 * 1000;

/**
 * Painel administrativo. O que a tela deve conter está em `README.md`.
 *
 * Das três abas, só "usuários com chaves" tem fonte de dados no lab — ela é
 * derivada das próprias API keys. As outras duas dependem de um log de
 * auditoria que não existe, e dizem isso em vez de mostrar número inventado:
 * um painel de administração que mente é pior que um vazio.
 */
export function AdminPage() {
  const api = useApi(apiKeysApiRef);
  const [tab, setTab] = useState('users');

  const { value, loading, error } = useAsync(() => api.list(), [api]);

  const users: UserWithKeys[] = useMemo(() => {
    const byOwner = new Map<string, UserWithKeys>();

    for (const key of value ?? []) {
      const current = byOwner.get(key.owner) ?? {
        id: key.owner,
        user: key.owner,
        activeKeys: 0,
        totalKeys: 0,
        lastUsedMs: null,
      };

      current.totalKeys += 1;
      if (key.status === 'active') current.activeKeys += 1;

      if (key.lastUsedAt) {
        const ms = new Date(key.lastUsedAt).getTime();
        if (current.lastUsedMs === null || ms > current.lastUsedMs) current.lastUsedMs = ms;
      }

      byOwner.set(key.owner, current);
    }

    return [...byOwner.values()].sort((a, b) => b.activeKeys - a.activeKeys);
  }, [value]);

  const stats = useMemo(() => {
    const keys = value ?? [];
    const active = keys.filter(k => k.status === 'active');
    return {
      users: users.length,
      active: active.length,
      // Ativa e sem uso há 30 dias (ou nunca usada e criada há mais de 30):
      // candidata a revogação — credencial esquecida é superfície de ataque.
      stale: active.filter(k => {
        const reference = k.lastUsedAt ?? k.createdAt;
        return Date.now() - new Date(reference).getTime() > MONTH;
      }).length,
    };
  }, [value, users]);

  const userColumns: Column<UserWithKeys>[] = [
    {
      key: 'user',
      header: 'Usuário',
      render: row => <span className="atlas-resourceCell">{row.user}</span>,
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
    {
      key: 'lastUsage',
      header: 'Último uso',
      render: row =>
        row.lastUsedMs === null
          ? 'nunca'
          : new Date(row.lastUsedMs).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Administração"
      title="Administração"
      subtitle="Uso do portal, atividade das chaves de API e usuários com credenciais ativas."
      actions={<Badge variant="purple">acesso admin</Badge>}
    >
      <div className="atlas-topOverviewCardsGrid">
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Usuários com chaves</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.users}</div>
          <div className="atlas-metricCardSub">emitiram ao menos uma chave</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Chaves ativas</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.active}</div>
          <div className="atlas-metricCardSub">em todo o portal</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Sem uso há 30 dias</span></div>
          <div className="atlas-metricBigValue" style={stats.stale ? { color: 'var(--warning)' } : undefined}>
            {loading ? '—' : stats.stale}
          </div>
          <div className="atlas-metricCardSub">ativas e paradas — candidatas a revogação</div>
        </div>
      </div>

      <section className="atlas-tableContainerCard">
        <div className="atlas-sectionCardHeader">
          <h3 className="atlas-sectionCardTitle">
            <ShieldIcon fontSize="small" /> Painel administrativo
          </h3>
          <Tabs
            tabs={[
              { id: 'users', label: 'Usuários com chaves' },
              { id: 'portal', label: 'Uso do portal' },
              { id: 'api', label: 'Uso da API' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'users' && (
          <DataTable
            columns={userColumns}
            rows={users}
            loading={loading}
            emptyMessage="Nenhum usuário emitiu chaves ainda."
          />
        )}

        {tab === 'portal' && (
          <div className="atlas-emptyState" style={{ textAlign: 'left' }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              Sem log de acessos no lab
            </strong>
            <p style={{ margin: '8px 0 0' }}>
              Esta aba mostraria quem acessou o portal e quando. O lab não
              registra acessos: o backend loga requisições no console, mas
              nada é persistido nem consultável.
            </p>
            <p style={{ margin: '8px 0 0' }}>
              O que faltaria: um plugin de auditoria que grave usuário, rota e
              horário numa tabela própria, com retenção definida — dado de
              acesso é dado pessoal e não pode ficar guardado para sempre sem
              critério.
            </p>
          </div>
        )}

        {tab === 'api' && (
          <div className="atlas-emptyState" style={{ textAlign: 'left' }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              Sem log de requisições no lab
            </strong>
            <p style={{ margin: '8px 0 0' }}>
              Esta aba mostraria cada chamada autenticada por chave: horário,
              método, rota e corpo. Hoje o plugin de API keys grava apenas o
              carimbo do último uso de cada chave — suficiente para achar
              chave esquecida, não para auditar chamadas.
            </p>
            <p style={{ margin: '8px 0 0' }}>
              O que faltaria: registrar cada validação de chave numa tabela de
              uso. É a mudança menor das duas, porque o ponto de captura já
              existe em <code className="atlas-costMono">ApiKeyStore.validate</code>.
            </p>
          </div>
        )}
      </section>
    </AtlasPage>
  );
}
