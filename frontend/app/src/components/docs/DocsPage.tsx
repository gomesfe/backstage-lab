import { useCallback, useEffect, useMemo, useState } from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import { Content, Page, Progress } from '@backstage/core-components';
import { distintos, ITENS_POR_PAGINA, paginar, type FiltrosColuna } from '../shared/filtros';
import { useAtlasStyles } from '../shared/styles';
import { useFavoritos } from '../shared/useFavoritos';
import { Filters } from './Filters';
import { Table } from './Table';
import { useDocs } from './hooks/useDocs';
import { filtrarDocumentos, ROTULO_TIPO, SEM_FILTROS, temFiltro } from './helpers';
import type { Filtros } from './types';

/** Docs: o índice do que publica documentação técnica (TechDocs). */
export function DocsPage() {
  const classes = useAtlasStyles();
  const { documentos, loading } = useDocs();
  const padrao = useMemo(() => documentos.filter(documento => documento.favorito).map(documento => documento.ancora), [documentos]);
  const { favoritos, alternar } = useFavoritos('docs', padrao);

  const [filtros, setFiltros] = useState<Filtros>(SEM_FILTROS);
  const [colunas, setColunas] = useState<FiltrosColuna>({});
  const [pagina, setPagina] = useState(0);
  const porPagina = ITENS_POR_PAGINA[2];

  useEffect(() => {
    setPagina(0);
  }, [filtros, colunas]);

  const filtrados = useMemo(() => filtrarDocumentos(documentos, filtros, colunas, favoritos), [documentos, filtros, colunas, favoritos]);
  const tipos = useMemo(() => distintos(documentos.map(documento => ROTULO_TIPO[documento.tipo])), [documentos]);
  const donos = useMemo(() => distintos(documentos.map(documento => documento.dono)), [documentos]);
  const ciclos = useMemo(() => distintos(documentos.map(documento => documento.cicloDeVida)), [documentos]);
  const onColuna = useCallback((coluna: string, valor: string) => setColunas(atuais => ({ ...atuais, [coluna]: valor })), []);

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>TechDocs</span>
              <h1 className={classes.title}>Docs</h1>
              <p className={classes.subtitle}>Documentação técnica versionada junto ao código dos componentes.</p>
            </div>
          </div>

          <section className={classes.card}>
            <div className={classes.toolbar}>
              <h3 className={classes.toolbarTitle}>
                Documentação
                <span className={classes.count}>{filtrados.length}</span>
              </h3>
            </div>
            <Filters
              filtros={filtros}
              tipos={tipos}
              donos={donos}
              ciclos={ciclos}
              podeLimpar={temFiltro(filtros, colunas)}
              onChange={setFiltros}
              onLimpar={() => {
                setFiltros(SEM_FILTROS);
                setColunas({});
              }}
            />

            {loading && <Progress />}
            {!loading && documentos.length === 0 && (
              <div className={classes.empty}>
                Nada publica documentação ainda. Adicione a anotação <code>backstage.io/techdocs-ref</code> ao catalog-info.yaml do
                componente.
              </div>
            )}
            {!loading && documentos.length > 0 && (
              <>
                <Table
                  documentos={paginar(filtrados, pagina, porPagina)}
                  favoritos={favoritos}
                  colunas={colunas}
                  onColuna={onColuna}
                  onFavorito={documento => alternar(documento.ancora)}
                />
                {filtrados.length === 0 && <div className={classes.empty}>Nada encontrado com esses filtros.</div>}
                {filtrados.length > 0 && (
                  <TablePagination
                    component="div"
                    className={classes.pagination}
                    count={filtrados.length}
                    page={Math.min(pagina, Math.max(0, Math.ceil(filtrados.length / porPagina) - 1))}
                    rowsPerPage={porPagina}
                    rowsPerPageOptions={[]}
                    onPageChange={(_, nova) => setPagina(nova)}
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </Content>
    </Page>
  );
}
