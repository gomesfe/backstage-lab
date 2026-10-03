import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TablePagination from '@material-ui/core/TablePagination';
import { Content, Page, Progress } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';
import { atlasApprovalsReviewPermission } from '../../atlas/permissions';
import { distintos, ITENS_POR_PAGINA, paginar, type FiltrosColuna } from '../shared/filtros';
import { Dialogs } from './Dialogs';
import { Filters } from './Filters';
import { Header } from './Header';
import { Table } from './Table';
import { useApprovals } from './hooks/useApprovals';
import { contar, filtrar } from './helpers';
import { useStyles } from './styles';
import type { Dialogo, Filtros, FiltroStatus, Lado } from './types';

/** `?status=` dos links (pending, running, history, all) → aba de status. */
const STATUS_DO_ENDERECO: Record<string, FiltroStatus> = {
  pending: 'pendentes',
  running: 'execucao',
  history: 'historico',
  all: 'todos',
};

const ROTULO_LADO: Record<Lado, string> = {
  aprovacao: 'Minhas aprovações',
  solicitacao: 'Minhas solicitações',
};

function filtrosIniciais(busca: string, status: FiltroStatus): Record<Lado, Filtros> {
  const base: Filtros = { busca, status, ambiente: '', grupo: '' };
  return { aprovacao: base, solicitacao: base };
}

/**
 * Aprovações: o que pedem para você aprovar e o que você pediu. É a mesma
 * tabela nos dois lados; a página guarda o estado (lado, filtros, página,
 * diálogo) e Header, Filters, Table e Dialogs só desenham.
 */
export function ApprovalsPage() {
  const classes = useStyles();
  const { search, hash } = useLocation();
  const { solicitacoes, loading, aprovar, rejeitar, cancelar } = useApprovals();
  const { allowed: aprovador, loading: carregandoPermissao } = usePermission({ permission: atlasApprovalsReviewPermission });

  const parametros = new URLSearchParams(search);
  const buscaDoEndereco = parametros.get('q') ?? '';
  const statusDoEndereco = STATUS_DO_ENDERECO[parametros.get('status') ?? ''] ?? 'pendentes';

  const [ladoEscolhido, setLadoEscolhido] = useState<Lado>(hash === '#requester' ? 'solicitacao' : 'aprovacao');
  const [filtros, setFiltros] = useState(() => filtrosIniciais(buscaDoEndereco, statusDoEndereco));
  const [colunas, setColunas] = useState<Record<Lado, FiltrosColuna>>({ aprovacao: {}, solicitacao: {} });
  const [porPagina, setPorPagina] = useState(ITENS_POR_PAGINA[0]);
  const [pagina, setPagina] = useState(0);
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  // Sem a permissão de aprovador, a tela é só "Minhas solicitações".
  const lado: Lado = aprovador ? ladoEscolhido : 'solicitacao';

  // O endereço muda sem remontar a página (link do mapa com outro recurso).
  useEffect(() => {
    if (hash === '#requester') setLadoEscolhido('solicitacao');
    if (hash === '#approver') setLadoEscolhido('aprovacao');
  }, [hash]);
  useEffect(() => {
    setFiltros(filtrosIniciais(buscaDoEndereco, statusDoEndereco));
  }, [buscaDoEndereco, statusDoEndereco]);
  // Volta para a primeira página quando o que está na tela muda.
  useEffect(() => {
    setPagina(0);
  }, [lado, filtros, colunas, porPagina]);

  const doLado = useMemo(() => solicitacoes.filter(item => item.lado === lado), [solicitacoes, lado]);
  const filtradas = useMemo(() => filtrar(doLado, filtros[lado], colunas[lado]), [doLado, filtros, colunas, lado]);
  const contagens = useMemo(() => contar(doLado), [doLado]);
  const grupos = useMemo(() => distintos(doLado.map(item => item.grupo)), [doLado]);
  const pendentesParaVoce = useMemo(
    () => solicitacoes.filter(item => item.lado === 'aprovacao' && item.status === 'aguardando').length,
    [solicitacoes],
  );

  const mudarFiltros = useCallback((novos: Filtros) => setFiltros(atuais => ({ ...atuais, [lado]: novos })), [lado]);
  const mudarColuna = useCallback(
    (coluna: string, valor: string) => setColunas(atuais => ({ ...atuais, [lado]: { ...atuais[lado], [coluna]: valor } })),
    [lado],
  );

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Governança</span>
              <h1 className={classes.title}>Aprovações</h1>
              <p className={classes.subtitle}>Aprove o que pedem para você e acompanhe o que você pediu.</p>
            </div>
          </div>

          {aprovador && (
            <div className={classes.tabs} role="tablist" aria-label="Lado do pedido">
              {(['aprovacao', 'solicitacao'] as Lado[]).map(item => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={lado === item}
                  className={`${classes.tab} ${lado === item ? classes.tabActive : ''}`}
                  onClick={() => setLadoEscolhido(item)}
                >
                  {ROTULO_LADO[item]}
                  {item === 'aprovacao' && (
                    <span className={`${classes.tabCount} ${lado === item ? classes.tabCountActive : ''}`}>{pendentesParaVoce}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <Header
            lado={lado}
            contagens={contagens}
            filtroStatus={filtros[lado].status}
            onFiltroStatus={status => mudarFiltros({ ...filtros[lado], status })}
          />

          <section className={classes.card}>
            <div className={classes.toolbar}>
              <h3 className={classes.toolbarTitle}>
                {ROTULO_LADO[lado]}
                <span className={classes.count}>{filtradas.length}</span>
              </h3>
            </div>
            <Filters
              filtros={filtros[lado]}
              contagens={contagens}
              grupos={grupos}
              porPagina={porPagina}
              onChange={mudarFiltros}
              onPorPagina={setPorPagina}
            />

            {(loading || carregandoPermissao) && <Progress />}
            {!loading && !carregandoPermissao && (
              <Table
                titulo={ROTULO_LADO[lado]}
                solicitacoes={paginar(filtradas, pagina, porPagina)}
                colunas={colunas[lado]}
                onColuna={mudarColuna}
                onAbrir={setDialogo}
              />
            )}

            {!loading && filtradas.length === 0 && (
              <div className={classes.empty}>
                {lado === 'aprovacao' ? 'Nada esperando a sua aprovação com esses filtros.' : 'Nenhuma solicitação com esses filtros.'}
              </div>
            )}
            {!loading && filtradas.length > 0 && (
              <TablePagination
                component="div"
                className={classes.pagination}
                count={filtradas.length}
                page={Math.min(pagina, Math.max(0, Math.ceil(filtradas.length / porPagina) - 1))}
                rowsPerPage={porPagina}
                rowsPerPageOptions={[]}
                onPageChange={(_, nova) => setPagina(nova)}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              />
            )}
          </section>
        </div>
        <Dialogs
          dialogo={dialogo}
          onClose={() => setDialogo(null)}
          onOpen={setDialogo}
          onAprovar={aprovar}
          onRejeitar={rejeitar}
          onCancelar={cancelar}
        />
      </Content>
    </Page>
  );
}
