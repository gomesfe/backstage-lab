import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TablePagination from '@material-ui/core/TablePagination';
import CloudIcon from '@material-ui/icons/CloudQueue';
import FolderIcon from '@material-ui/icons/FolderOpen';
import LockIcon from '@material-ui/icons/LockOutlined';
import { Content, Page, Progress } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';
import { atlasInternalViewPermission } from '../../atlas/permissions';
import { Dialogs } from './Dialogs';
import { Filters } from './Filters';
import { Header } from './Header';
import { InternalTable } from './InternalTable';
import { RepositoriesTable } from './RepositoriesTable';
import { Table } from './Table';
import { Toolbar } from './Toolbar';
import { useProvisioningMap } from './hooks/useProvisioningMap';
import { distintos, filtrarRecursos, filtrarRepositorios, filtrosAtivos, ITENS_POR_PAGINA, paginar } from './helpers';
import { useStyles } from './styles';
import type { Aba, Dialogo, FiltrosColuna, FiltrosRecursos } from './types';

const SEM_FILTROS: FiltrosRecursos = { busca: '', oferta: '', servico: '' };

/** Aba inicial pelo endereço: `#repositorios` ou `#interno` (links da Home usam isso). */
function abaDoEndereco(hash: string): Aba {
  if (hash === '#repositorios') return 'repositorios';
  if (hash === '#interno') return 'interno';
  return 'recursos';
}

/**
 * Mapa de provisionamento: onde cada recurso está, por qual oferta, e o que dá
 * para promover ou excluir. A página guarda o estado (aba, filtros, página,
 * diálogo); Toolbar, Filters, Table e Dialogs só desenham.
 */
export function ProvisioningMapPage() {
  const classes = useStyles();
  const { search, hash } = useLocation();
  const { recursos, repositorios, internos, servicos, loading, refresh } = useProvisioningMap();
  const { allowed: verInterno } = usePermission({ permission: atlasInternalViewPermission });

  const parametros = new URLSearchParams(search);
  const servicoDoEndereco = parametros.get('service') ?? '';
  const buscaDoEndereco = parametros.get('q') ?? '';
  const [aba, setAba] = useState<Aba>(() => abaDoEndereco(hash));
  const [filtrosRecursos, setFiltrosRecursos] = useState<FiltrosRecursos>({ ...SEM_FILTROS, busca: buscaDoEndereco, servico: servicoDoEndereco });
  const [filtrosRepositorios, setFiltrosRepositorios] = useState<FiltrosRecursos>({ ...SEM_FILTROS, servico: servicoDoEndereco });
  const [filtrosAbertos, setFiltrosAbertos] = useState(Boolean(servicoDoEndereco || buscaDoEndereco));
  const [colunasRecursos, setColunasRecursos] = useState<FiltrosColuna>({});
  const [colunasRepositorios, setColunasRepositorios] = useState<FiltrosColuna>({});
  const [porPagina, setPorPagina] = useState(ITENS_POR_PAGINA[0]);
  const [pagina, setPagina] = useState(0);
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  // O endereço muda sem remontar a página (link da Home com outro serviço/aba).
  useEffect(() => {
    setAba(abaDoEndereco(hash));
  }, [hash]);
  useEffect(() => {
    setFiltrosRecursos(atual => ({ ...atual, servico: servicoDoEndereco }));
    setFiltrosRepositorios(atual => ({ ...atual, servico: servicoDoEndereco }));
    if (servicoDoEndereco) setFiltrosAbertos(true);
  }, [servicoDoEndereco]);
  // `?q=nome` (link "Ver no mapa" de Aprovações) já abre buscando o recurso.
  useEffect(() => {
    setFiltrosRecursos(atual => ({ ...atual, busca: buscaDoEndereco }));
    if (buscaDoEndereco) setFiltrosAbertos(true);
  }, [buscaDoEndereco]);
  // Volta para a primeira página quando o que está na tela muda.
  useEffect(() => {
    setPagina(0);
  }, [aba, filtrosRecursos, filtrosRepositorios, colunasRecursos, colunasRepositorios, porPagina]);

  const recursosFiltrados = useMemo(
    () => filtrarRecursos(recursos, filtrosRecursos, colunasRecursos, servicos),
    [recursos, filtrosRecursos, colunasRecursos, servicos],
  );
  const repositoriosFiltrados = useMemo(
    () => filtrarRepositorios(repositorios, filtrosRepositorios, colunasRepositorios, servicos),
    [repositorios, filtrosRepositorios, colunasRepositorios, servicos],
  );
  const ofertasRecursos = useMemo(() => distintos(recursos.map(recurso => recurso.oferta)), [recursos]);
  const ofertasRepositorios = useMemo(() => distintos(repositorios.map(repositorio => repositorio.oferta)), [repositorios]);
  const siglas = useMemo(() => distintos(Object.keys(servicos)), [servicos]);

  const onColunaRecurso = useCallback((coluna: string, valor: string) => setColunasRecursos(atual => ({ ...atual, [coluna]: valor })), []);
  const onColunaRepositorio = useCallback(
    (coluna: string, valor: string) => setColunasRepositorios(atual => ({ ...atual, [coluna]: valor })),
    [],
  );

  const totais: Record<Aba, number> = {
    recursos: recursosFiltrados.length,
    repositorios: repositoriosFiltrados.length,
    interno: internos.length,
  };
  const total = totais[aba];

  const abas: { id: Aba; rotulo: string; contagem: number; icone: JSX.Element }[] = [
    { id: 'recursos', rotulo: 'Recursos · com IaC', contagem: recursos.length, icone: <CloudIcon style={{ fontSize: 16 }} /> },
    { id: 'repositorios', rotulo: 'Repositórios · sem IaC', contagem: repositorios.length, icone: <FolderIcon style={{ fontSize: 16 }} /> },
  ];
  if (verInterno) abas.push({ id: 'interno', rotulo: 'Interno do Atlas', contagem: internos.length, icone: <LockIcon style={{ fontSize: 16 }} /> });

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <Header totalRecursos={recursos.length} totalServicos={siglas.length} totalOfertas={ofertasRecursos.length} onRefresh={refresh} />

          <div className={classes.tabs} role="tablist" aria-label="O que mostrar no mapa">
            {abas.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={aba === item.id}
                className={`${classes.tab} ${aba === item.id ? classes.tabActive : ''}`}
                onClick={() => setAba(item.id)}
              >
                {item.icone}
                {item.rotulo}
                <span className={`${classes.tabCount} ${aba === item.id ? classes.tabCountActive : ''}`}>{item.contagem}</span>
              </button>
            ))}
          </div>

          <section className={classes.card}>
            {aba === 'recursos' && (
              <>
                <Toolbar
                  titulo="Recursos"
                  total={recursosFiltrados.length}
                  selo={{ texto: 'com IaC', tipo: 'iac' }}
                  filtrosAbertos={filtrosAbertos}
                  filtrosAtivos={filtrosAtivos(filtrosRecursos)}
                  onToggleFiltros={() => setFiltrosAbertos(aberto => !aberto)}
                  porPagina={porPagina}
                  onPorPagina={setPorPagina}
                />
                {filtrosAbertos && (
                  <Filters
                    filtros={filtrosRecursos}
                    ofertas={ofertasRecursos}
                    servicos={siglas}
                    buscaPlaceholder="Nome do recurso"
                    onChange={setFiltrosRecursos}
                  />
                )}
              </>
            )}
            {aba === 'repositorios' && (
              <>
                <Toolbar
                  titulo="Repositórios"
                  total={repositoriosFiltrados.length}
                  selo={{ texto: 'sem IaC', tipo: 'semIac' }}
                  filtrosAbertos={filtrosAbertos}
                  filtrosAtivos={filtrosAtivos(filtrosRepositorios)}
                  onToggleFiltros={() => setFiltrosAbertos(aberto => !aberto)}
                  porPagina={porPagina}
                  onPorPagina={setPorPagina}
                />
                {filtrosAbertos && (
                  <Filters
                    filtros={filtrosRepositorios}
                    ofertas={ofertasRepositorios}
                    servicos={siglas}
                    buscaPlaceholder="Nome do repositório"
                    onChange={setFiltrosRepositorios}
                  />
                )}
              </>
            )}
            {aba === 'interno' && (
              <Toolbar
                titulo="Interno do Atlas"
                total={internos.length}
                filtrosAbertos={false}
                filtrosAtivos={0}
                onToggleFiltros={() => undefined}
                porPagina={porPagina}
                onPorPagina={setPorPagina}
              />
            )}

            {loading && <Progress />}
            {!loading && aba === 'recursos' && (
              <Table
                recursos={paginar(recursosFiltrados, pagina, porPagina)}
                servicos={servicos}
                colunas={colunasRecursos}
                onColuna={onColunaRecurso}
                onPromover={(recurso, ambiente) => setDialogo({ tipo: 'promover', recurso, ambiente })}
                onExcluir={(recurso, ambiente) => setDialogo({ tipo: 'excluir', recurso, ambiente })}
                onDetalhesAmbiente={(recurso, ambiente) => setDialogo({ tipo: 'promocao', recurso, ambiente })}
                onDetalhes={recurso => setDialogo({ tipo: 'recurso', recurso })}
              />
            )}
            {!loading && aba === 'repositorios' && (
              <RepositoriesTable
                repositorios={paginar(repositoriosFiltrados, pagina, porPagina)}
                servicos={servicos}
                colunas={colunasRepositorios}
                onColuna={onColunaRepositorio}
                onDetalhes={repositorio => setDialogo({ tipo: 'repositorio', repositorio })}
                onExcluir={repositorio => setDialogo({ tipo: 'excluirRepositorio', repositorio })}
              />
            )}
            {!loading && aba === 'interno' && <InternalTable itens={paginar(internos, pagina, porPagina)} />}

            {!loading && total === 0 && <div className={classes.empty}>Nada encontrado com esses filtros.</div>}
            {!loading && total > 0 && (
              <TablePagination
                component="div"
                className={classes.pagination}
                count={total}
                page={Math.min(pagina, Math.max(0, Math.ceil(total / porPagina) - 1))}
                rowsPerPage={porPagina}
                rowsPerPageOptions={[]}
                onPageChange={(_, nova) => setPagina(nova)}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            )}
          </section>
        </div>
        <Dialogs dialogo={dialogo} servicos={servicos} onClose={() => setDialogo(null)} onOpen={setDialogo} />
      </Content>
    </Page>
  );
}
