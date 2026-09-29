import { useEffect, useMemo, useState, type ReactNode } from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { usePermission } from '@backstage/plugin-permission-react';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
  Alert,
  AtlasPage,
  Badge,
  DataTable,
  Modal,
  Pagination,
  type Column,
} from '../../components';
import { provisioningRefreshPermission } from '../_shared/permissions';
import { ENVIRONMENTS, formatDate, formatDateTime, type Environment } from '../_shared/environments';
import {
  CLOUD_APPROVAL_ENVS,
  FREE_DELETE_WINDOW_HOURS,
  SERVICES,
  loadProvisioning,
  type ProvisionedResource,
  type Repository,
} from './provisioningData';

const PAGE_SIZES = [10, 15, 25, 50];

const includes = (value: string, term: string) => value.toLowerCase().includes(term.trim().toLowerCase());
const ageInHours = (iso: string) => (Date.now() - Date.parse(iso)) / 3_600_000;

/** Paginação com tamanho de página escolhível; volta à 1ª página quando a lista muda. */
function usePaging<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [rows.length, pageSize]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  return {
    page: Math.min(page, pageCount),
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    pageRows: rows.slice((Math.min(page, pageCount) - 1) * pageSize, Math.min(page, pageCount) * pageSize),
  };
}

const FunnelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 5h18l-7 8.5V19l-4 2v-7.5z" />
  </svg>
);

/** Barra acima de cada tabela: título, botão Filtros, itens por página e ações extras. */
function TableToolbar({
  title,
  count,
  filtersOpen,
  activeFilters,
  onToggleFilters,
  pageSize,
  onPageSize,
  extra,
  children,
}: {
  title: string;
  count: number;
  filtersOpen: boolean;
  activeFilters: number;
  onToggleFilters: () => void;
  pageSize: number;
  onPageSize: (size: number) => void;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="atlas-sectionCardHeader">
        <h3 className="atlas-sectionCardTitle">
          {title} <span className="atlas-groupHeadingCount">{count}</span>
        </h3>
        <div className="atlas-filtersBar">
          <button
            type="button"
            className={`atlas-groupViewBtn ${filtersOpen || activeFilters ? 'atlas-groupViewBtnActive' : ''}`}
            aria-expanded={filtersOpen}
            onClick={onToggleFilters}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FunnelIcon /> Filtros{activeFilters ? ` (${activeFilters})` : ''}
          </button>
          <label className="atlas-labeledSelect" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <span className="atlas-labeledSelectLabel">Itens</span>
            <select className="atlas-filterSelect" value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
          {extra}
        </div>
      </div>
      {filtersOpen && <div className="atlas-filtersBar atlas-filtersBarWrap">{children}</div>}
    </>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="atlas-labeledSelect">
      <span className="atlas-labeledSelectLabel">{label}</span>
      <select className="atlas-filterSelect" value={value} onChange={e => onChange(e.target.value)}>
        {['Todos', ...options].map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

type Dialog =
  | { mode: 'details'; resource: ProvisionedResource }
  | { mode: 'delete'; resource: ProvisionedResource; env: Environment }
  | { mode: 'promote'; resource: ProvisionedResource; env: Environment }
  | { mode: 'repo'; repository: Repository }
  | null;

/**
 * Mapa de provisionamento. O que a tela deve conter está em `README.md`.
 */
export function ProvisioningMapPage() {
  const { allowed: canRefresh } = usePermission({ permission: provisioningRefreshPermission });
  const { value, loading, retry } = useAsyncRetry(loadProvisioning, []);
  const [resources, setResources] = useState<ProvisionedResource[]>([]);
  const repositories = useMemo(() => value?.repositories ?? [], [value]);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  useEffect(() => setResources(value?.resources ?? []), [value]);

  const [dialog, setDialog] = useState<Dialog>(null);

  /* ------------------------------------------------ filtros: recursos --- */
  const [resFiltersOpen, setResFiltersOpen] = useState(false);
  const [resName, setResName] = useState('');
  const [resService, setResService] = useState('');
  const [resTemplate, setResTemplate] = useState('');
  const [resTemplateSel, setResTemplateSel] = useState('Todos');
  const [resEnvSel, setResEnvSel] = useState('Todos');
  const [resServiceSel, setResServiceSel] = useState('Todos');

  const templates = useMemo(() => [...new Set(resources.map(r => r.template))].sort(), [resources]);
  const services = useMemo(() => [...new Set(resources.map(r => r.service))].sort(), [resources]);

  const resourceRows = useMemo(
    () =>
      resources
        .filter(r => includes(r.name, resName))
        .filter(r => includes(`${r.service} ${SERVICES[r.service] ?? ''}`, resService))
        .filter(r => includes(r.template, resTemplate))
        .filter(r => resTemplateSel === 'Todos' || r.template === resTemplateSel)
        .filter(r => resServiceSel === 'Todos' || r.service === resServiceSel)
        .filter(r => resEnvSel === 'Todos' || Boolean(r.environments[resEnvSel as Environment]))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [resources, resName, resService, resTemplate, resTemplateSel, resServiceSel, resEnvSel],
  );
  const resPaging = usePaging(resourceRows);
  const resActive = [resName, resService, resTemplate].filter(Boolean).length +
    [resTemplateSel, resEnvSel, resServiceSel].filter(v => v !== 'Todos').length;

  /* --------------------------------------------- filtros: repositórios --- */
  const [repoFiltersOpen, setRepoFiltersOpen] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoService, setRepoService] = useState('');
  const [repoTemplate, setRepoTemplate] = useState('');
  const [repoTemplateSel, setRepoTemplateSel] = useState('Todos');
  const [repoServiceSel, setRepoServiceSel] = useState('Todos');
  const repoTemplates = useMemo(() => [...new Set(repositories.map(r => r.template))].sort(), [repositories]);

  const repoRows = useMemo(
    () =>
      repositories
        .filter(r => includes(r.name, repoName))
        .filter(r => includes(`${r.service} ${SERVICES[r.service] ?? ''}`, repoService))
        .filter(r => includes(r.template, repoTemplate))
        .filter(r => repoTemplateSel === 'Todos' || r.template === repoTemplateSel)
        .filter(r => repoServiceSel === 'Todos' || r.service === repoServiceSel)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [repositories, repoName, repoService, repoTemplate, repoTemplateSel, repoServiceSel],
  );
  const repoPaging = usePaging(repoRows);
  const repoActive = [repoName, repoService, repoTemplate].filter(Boolean).length +
    [repoTemplateSel, repoServiceSel].filter(v => v !== 'Todos').length;

  /* --------------------------------------------------------------- ações --- */
  const setEnv = (id: string, env: Environment, state: ProvisionedResource['environments'][Environment] | undefined) =>
    setResources(current =>
      current.map(r => {
        if (r.id !== id) return r;
        const environments = { ...r.environments };
        if (state) environments[env] = state;
        else delete environments[env];
        return { ...r, environments };
      }),
    );

  const confirm = () => {
    if (!dialog) return;
    if (dialog.mode === 'delete') {
      const state = dialog.resource.environments[dialog.env]!;
      // Dentro da janela de 72 h sai direto; depois vira pedido de exclusão.
      if (ageInHours(state.provisionedAt) <= FREE_DELETE_WINDOW_HOURS) setEnv(dialog.resource.id, dialog.env, undefined);
      else setEnv(dialog.resource.id, dialog.env, { ...state, pending: 'deletion' });
    }
    if (dialog.mode === 'promote') {
      setEnv(dialog.resource.id, dialog.env, {
        provisionedAt: new Date().toISOString(),
        pending: CLOUD_APPROVAL_ENVS.includes(dialog.env) ? 'promotion' : undefined,
      });
    }
    setDialog(null);
  };

  const refresh = () => {
    retry();
    setRefreshedAt(new Date().toISOString());
  };

  /* ------------------------------------------------------------- colunas --- */
  const envCell = (r: ProvisionedResource, env: Environment) => {
    const state = r.environments[env];
    if (state) {
      const free = ageInHours(state.provisionedAt) <= FREE_DELETE_WINDOW_HOURS;
      return (
        <span className="atlas-envCell">
          <span className="atlas-envDate" title={formatDateTime(state.provisionedAt)}>{formatDate(state.provisionedAt)}</span>
          {state.pending === 'deletion' ? (
            <Badge variant="warning">exclusão pendente</Badge>
          ) : state.pending === 'promotion' ? (
            <Badge variant="warning">aguardando cloud</Badge>
          ) : r.iac ? (
            <button
              type="button"
              className="atlas-actionBtnLink atlas-actionBtnDanger"
              title={free ? `Provisionado há menos de ${FREE_DELETE_WINDOW_HOURS} h: sai sem aprovação` : 'Precisa de aprovação'}
              onClick={() => setDialog({ mode: 'delete', resource: r, env })}
            >
              {free ? 'Excluir' : 'Solicitar exclusão'}
            </button>
          ) : null}
        </span>
      );
    }
    return (
      <span className="atlas-envCell">
        {r.iac ? (
          <button type="button" className="atlas-actionBtnLink" onClick={() => setDialog({ mode: 'promote', resource: r, env })}>
            Promover
          </button>
        ) : (
          <span className="atlas-envEmpty">—</span>
        )}
      </span>
    );
  };

  const resourceColumns: Column<ProvisionedResource>[] = [
    {
      key: 'name',
      header: 'Nome do recurso',
      filter: { value: resName, onChange: setResName, placeholder: 'Pesquisar nome' },
      render: r => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="atlas-resourceCell">{r.name}</span>
          {r.iac ? <Badge variant="lime">IaC</Badge> : <Badge variant="warning" >fora do IaC</Badge>}
        </span>
      ),
    },
    {
      key: 'service',
      header: 'Serviço Núclea',
      filter: { value: resService, onChange: setResService, placeholder: 'Sigla ou nome' },
      render: r => <span className="atlas-tagChip" title={SERVICES[r.service]}>{r.service}</span>,
    },
    {
      key: 'template',
      header: 'Oferta',
      filter: { value: resTemplate, onChange: setResTemplate, placeholder: 'Pesquisar oferta' },
      render: r => r.template,
    },
    ...ENVIRONMENTS.map(env => ({
      key: env,
      header: env,
      className: 'atlas-envTd',
      render: (r: ProvisionedResource) => envCell(r, env),
    })),
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: r => (
        <button type="button" className="atlas-actionBtnLink" onClick={() => setDialog({ mode: 'details', resource: r })}>
          Detalhes
        </button>
      ),
    },
  ];

  const repoColumns: Column<Repository>[] = [
    {
      key: 'name',
      header: 'Repositório',
      filter: { value: repoName, onChange: setRepoName, placeholder: 'Pesquisar repositório' },
      render: r => <span className="atlas-resourceCell">{r.name}</span>,
    },
    {
      key: 'service',
      header: 'Serviço Núclea',
      filter: { value: repoService, onChange: setRepoService, placeholder: 'Sigla ou nome' },
      render: r => <span className="atlas-tagChip" title={SERVICES[r.service]}>{r.service}</span>,
    },
    {
      key: 'template',
      header: 'Oferta',
      filter: { value: repoTemplate, onChange: setRepoTemplate, placeholder: 'Pesquisar oferta' },
      render: r => r.template,
    },
    { key: 'resources', header: 'Recursos', align: 'right', render: r => r.resources },
    { key: 'visibility', header: 'Visibilidade', render: r => <Badge variant={r.visibility === 'privado' ? 'purple' : 'info'}>{r.visibility}</Badge> },
    { key: 'createdAt', header: 'Criado em', render: r => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: r => (
        <button type="button" className="atlas-actionBtnLink" onClick={() => setDialog({ mode: 'repo', repository: r })}>
          Detalhes
        </button>
      ),
    },
  ];

  /* -------------------------------------------------------------- números --- */
  const stats = {
    iac: resources.filter(r => r.iac).length,
    services: new Set(resources.map(r => r.service)).size,
    templates: templates.length,
  };

  const deleteState = dialog?.mode === 'delete' ? dialog.resource.environments[dialog.env] : undefined;
  const deleteIsFree = deleteState ? ageInHours(deleteState.provisionedAt) <= FREE_DELETE_WINDOW_HOURS : false;

  return (
    <AtlasPage
      eyebrow="Provisionamento"
      title="Mapa de provisionamento"
      subtitle="Onde cada recurso está provisionado, por qual oferta, e o que dá para promover ou excluir."
      actions={
        canRefresh ? (
          <button
            type="button"
            className="atlas-btnPill"
            onClick={refresh}
            disabled={loading}
            title="Relê o inventário. Só administradores."
          >
            <RefreshIcon style={{ fontSize: 16 }} /> {loading ? 'Atualizando…' : 'Refresh admin'}
          </button>
        ) : undefined
      }
    >
      <Alert variant="info" title="Dados de exemplo">
        O lab ainda não tem o inventário de provisionamento. Os recursos abaixo são exemplos, e excluir
        ou promover muda só esta sessão.
        {refreshedAt && ` Última leitura: ${formatDateTime(refreshedAt)}.`}
      </Alert>

      <div className="atlas-topOverviewCardsGrid">
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Recursos IaC</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.iac}</div>
          <div className="atlas-metricCardSub">{resources.length - stats.iac} fora do IaC</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Serviços Núclea</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.services}</div>
          <div className="atlas-metricCardSub">com recurso provisionado</div>
        </div>
        <div className="atlas-expandMetricCard">
          <div className="atlas-metricCardHead"><span className="atlas-metricCardTitle">Ofertas</span></div>
          <div className="atlas-metricBigValue">{loading ? '—' : stats.templates}</div>
          <div className="atlas-metricCardSub">em uso nos recursos</div>
        </div>
      </div>

      <Alert variant="warning" title="Regras">
        Deleções solicitadas em até {FREE_DELETE_WINDOW_HOURS} horas não exigem aprovação. Alguns recursos podem
        exigir aprovação do time de cloud antes da execução — promoções para {CLOUD_APPROVAL_ENVS.join(' e ')} passam por ele.
      </Alert>

      <section className="atlas-tableContainerCard">
        <TableToolbar
          title="Recursos"
          count={resourceRows.length}
          filtersOpen={resFiltersOpen}
          activeFilters={resActive}
          onToggleFilters={() => setResFiltersOpen(o => !o)}
          pageSize={resPaging.pageSize}
          onPageSize={resPaging.setPageSize}
        >
          <div className="atlas-searchFieldWrap">
            <input className="atlas-filterInput" placeholder="Nome do recurso" aria-label="Nome do recurso" value={resName} onChange={e => setResName(e.target.value)} />
          </div>
          <Select label="Oferta" value={resTemplateSel} options={templates} onChange={setResTemplateSel} />
          <Select label="Ambiente" value={resEnvSel} options={[...ENVIRONMENTS]} onChange={setResEnvSel} />
          <Select label="Serviço" value={resServiceSel} options={services} onChange={setResServiceSel} />
          {resActive > 0 && (
            <button
              type="button"
              className="atlas-actionBtnLink"
              onClick={() => {
                setResName(''); setResService(''); setResTemplate('');
                setResTemplateSel('Todos'); setResEnvSel('Todos'); setResServiceSel('Todos');
              }}
            >
              Limpar filtros
            </button>
          )}
        </TableToolbar>
        <DataTable columns={resourceColumns} rows={resPaging.pageRows} loading={loading} emptyMessage="Nenhum recurso com esses filtros." />
        {!loading && resourceRows.length > 0 && (
          <Pagination page={resPaging.page} pageCount={resPaging.pageCount} onChange={resPaging.setPage} info={`${resourceRows.length} recursos`} />
        )}
      </section>

      <section className="atlas-tableContainerCard">
        <TableToolbar
          title="Repositórios"
          count={repoRows.length}
          filtersOpen={repoFiltersOpen}
          activeFilters={repoActive}
          onToggleFilters={() => setRepoFiltersOpen(o => !o)}
          pageSize={repoPaging.pageSize}
          onPageSize={repoPaging.setPageSize}
        >
          <div className="atlas-searchFieldWrap">
            <input className="atlas-filterInput" placeholder="Nome do repositório" aria-label="Nome do repositório" value={repoName} onChange={e => setRepoName(e.target.value)} />
          </div>
          <Select label="Oferta" value={repoTemplateSel} options={repoTemplates} onChange={setRepoTemplateSel} />
          <Select label="Serviço" value={repoServiceSel} options={services} onChange={setRepoServiceSel} />
          {repoActive > 0 && (
            <button
              type="button"
              className="atlas-actionBtnLink"
              onClick={() => {
                setRepoName(''); setRepoService(''); setRepoTemplate('');
                setRepoTemplateSel('Todos'); setRepoServiceSel('Todos');
              }}
            >
              Limpar filtros
            </button>
          )}
        </TableToolbar>
        <DataTable columns={repoColumns} rows={repoPaging.pageRows} loading={loading} emptyMessage="Nenhum repositório com esses filtros." />
        {!loading && repoRows.length > 0 && (
          <Pagination page={repoPaging.page} pageCount={repoPaging.pageCount} onChange={repoPaging.setPage} info={`${repoRows.length} repositórios`} />
        )}
      </section>

      <Modal
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        wide={dialog?.mode === 'details'}
        title={
          dialog?.mode === 'delete' ? (deleteIsFree ? 'Excluir recurso' : 'Solicitar exclusão')
            : dialog?.mode === 'promote' ? 'Promover recurso'
            : dialog?.mode === 'repo' ? dialog.repository.name
            : dialog?.mode === 'details' ? dialog.resource.name
            : ''
        }
        footer={
          dialog?.mode === 'delete' || dialog?.mode === 'promote' ? (
            <>
              <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Voltar</button>
              <button
                type="button"
                className={`atlas-btnPill ${dialog.mode === 'promote' ? 'atlas-btnPillLime' : ''}`}
                style={dialog.mode === 'delete' ? { color: 'var(--danger)', borderColor: 'rgba(255, 82, 82, 0.4)' } : undefined}
                onClick={confirm}
              >
                {dialog.mode === 'promote'
                  ? CLOUD_APPROVAL_ENVS.includes(dialog.env) ? 'Pedir promoção' : 'Promover'
                  : deleteIsFree ? 'Excluir' : 'Pedir exclusão'}
              </button>
            </>
          ) : (
            <button type="button" className="atlas-btnPill" onClick={() => setDialog(null)}>Fechar</button>
          )
        }
      >
        {dialog?.mode === 'delete' && deleteState && (
          <>
            <p className="atlas-text">
              <strong>{dialog.resource.name}</strong> em <strong>{dialog.env}</strong>, provisionado em{' '}
              {formatDateTime(deleteState.provisionedAt)}.
            </p>
            {deleteIsFree ? (
              <Alert variant="danger" title="Sai sem aprovação">
                Provisionado há menos de {FREE_DELETE_WINDOW_HOURS} horas: a exclusão é executada direto. Não dá para desfazer.
              </Alert>
            ) : (
              <Alert variant="warning" title="Precisa de aprovação">
                Provisionado há mais de {FREE_DELETE_WINDOW_HOURS} horas: a exclusão vira uma solicitação e aparece em Aprovações.
              </Alert>
            )}
          </>
        )}
        {dialog?.mode === 'promote' && (
          <>
            <p className="atlas-text">
              Provisionar <strong>{dialog.resource.name}</strong> em <strong>{dialog.env}</strong>, com a mesma oferta
              ({dialog.resource.template}).
            </p>
            {CLOUD_APPROVAL_ENVS.includes(dialog.env) && (
              <Alert variant="warning" title="Aprovação do time de cloud">
                Promoções para {dialog.env} esperam a aprovação do time de cloud antes de executar.
              </Alert>
            )}
          </>
        )}
        {dialog?.mode === 'details' && (
          <>
            <div className="atlas-readonlyGrid">
              {[
                ['Serviço Núclea', `${dialog.resource.service} — ${SERVICES[dialog.resource.service] ?? ''}`],
                ['Oferta', dialog.resource.template],
                ['Gerenciado por', dialog.resource.iac ? 'IaC (Terraform)' : 'fora do IaC'],
                ['Repositório', dialog.resource.repository],
              ].map(([label, v]) => (
                <div key={label} className="atlas-field">
                  <span className="atlas-fieldLabel">{label}</span>
                  <span className="atlas-readonlyValue">{v}</span>
                </div>
              ))}
            </div>
            <div className="atlas-recentTableWrap">
              <table className="atlas-recentTable">
                <thead>
                  <tr><th>Ambiente</th><th>Provisionado em</th><th>Situação</th></tr>
                </thead>
                <tbody>
                  {ENVIRONMENTS.map(env => {
                    const s = dialog.resource.environments[env];
                    return (
                      <tr key={env}>
                        <td className="atlas-resourceCell">{env}</td>
                        <td>{s ? formatDateTime(s.provisionedAt) : '—'}</td>
                        <td>
                          {!s ? 'não provisionado'
                            : s.pending === 'deletion' ? 'exclusão pendente'
                            : s.pending === 'promotion' ? 'aguardando time de cloud'
                            : 'ativo'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {dialog?.mode === 'repo' && (
          <div className="atlas-readonlyGrid">
            {[
              ['Serviço Núclea', `${dialog.repository.service} — ${SERVICES[dialog.repository.service] ?? ''}`],
              ['Oferta', dialog.repository.template],
              ['Recursos vinculados', String(dialog.repository.resources)],
              ['Visibilidade', dialog.repository.visibility],
              ['Criado em', formatDateTime(dialog.repository.createdAt)],
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
