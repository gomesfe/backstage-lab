import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import TablePagination from '@material-ui/core/TablePagination';
import SearchIcon from '@material-ui/icons/Search';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStarredEntities } from '@backstage/plugin-catalog-react';
import { FilterSelect } from '../shared/FilterSelect';
import {
  distintos,
  ITENS_POR_PAGINA,
  paginar,
  type FiltrosColuna,
} from '../shared/filtros';
import { useAtlasStyles } from '../shared/styles';
import { EntityTable } from './EntityTable';
import { useEntidades } from './hooks/useEntidades';
import {
  filtrarEntidades,
  filtrosDoEndereco,
  ROTULO_TIPO,
  SEM_FILTROS,
  temFiltro,
} from './helpers';
import type { Coluna, Entidade, Filtros } from './types';

type Props = {
  titulo: string;
  kinds: string[];
  colunas: Coluna[];
  /** Mostra o filtro Tipo (quando a lista mistura kinds). */
  filtroTipo?: boolean;
  /** Só o que publica documentação, e o nome abre a documentação. */
  docs?: boolean;
  /** Itens internos do Atlas: sem filtros de favorito, links nem ações. */
  interno?: boolean;
  /** O que dizer quando o catálogo não tem nada desse tipo. */
  vazio: string;
};

/**
 * Cartão com a lista de entidades do catálogo: busca, ★ Favoritos, filtros,
 * funil por coluna, tabela e paginação. Catálogo, APIs e Docs são esta mesma
 * peça com kinds e colunas diferentes — uma implementação só evita que
 * filtros e colunas divirjam entre elas.
 *
 * Favoritos usam as entidades favoritas do Backstage: ficam salvos por
 * usuário e são os mesmos da página da entidade.
 */
export function EntityListCard({
  titulo,
  kinds,
  colunas,
  filtroTipo = false,
  docs = false,
  interno = false,
  vazio,
}: Props) {
  const classes = useAtlasStyles();
  const { search } = useLocation();
  const { entidades, loading, error } = useEntidades(kinds, {
    soComDocs: docs,
    interno,
  });
  const { isStarredEntity, toggleStarredEntity } = useStarredEntities();

  const [filtros, setFiltros] = useState<Filtros>(() =>
    filtrosDoEndereco(search),
  );
  const [filtrosColuna, setFiltrosColuna] = useState<FiltrosColuna>({});
  const [porPagina, setPorPagina] = useState(ITENS_POR_PAGINA[0]);
  const [pagina, setPagina] = useState(0);

  // O endereço muda sem remontar a página (link da Home com outro filtro).
  useEffect(() => {
    setFiltros(filtrosDoEndereco(search));
  }, [search]);
  useEffect(() => {
    setPagina(0);
  }, [filtros, filtrosColuna, porPagina]);

  const ehFavorita = useCallback(
    (entidade: Entidade) => isStarredEntity(entidade.ref),
    [isStarredEntity],
  );
  const filtradas = useMemo(
    () => filtrarEntidades(entidades, filtros, filtrosColuna, ehFavorita),
    [entidades, filtros, filtrosColuna, ehFavorita],
  );
  const tipos = useMemo(
    () => distintos(entidades.map(entidade => entidade.tipo)),
    [entidades],
  );
  const donos = useMemo(
    () => distintos(entidades.map(entidade => entidade.dono).filter(Boolean)),
    [entidades],
  );
  const ciclos = useMemo(
    () => distintos(entidades.map(entidade => entidade.ciclo).filter(Boolean)),
    [entidades],
  );
  const onFiltroColuna = useCallback(
    (coluna: string, valor: string) =>
      setFiltrosColuna(atuais => ({ ...atuais, [coluna]: valor })),
    [],
  );

  return (
    <section className={classes.card}>
      <div className={classes.toolbar}>
        <h3 className={classes.toolbarTitle}>
          {titulo}
          <span className={classes.count}>{filtradas.length}</span>
        </h3>
        <FilterSelect
          label="Itens"
          value={porPagina === ITENS_POR_PAGINA[0] ? '' : String(porPagina)}
          options={ITENS_POR_PAGINA.slice(1).map(String)}
          allLabel={String(ITENS_POR_PAGINA[0])}
          clearable={false}
          onChange={valor => setPorPagina(Number(valor || ITENS_POR_PAGINA[0]))}
        />
      </div>

      <div className={classes.filters}>
        <label className={classes.search}>
          <SearchIcon style={{ fontSize: 18 }} />
          <input
            type="search"
            placeholder="Buscar por nome, descrição ou tag"
            aria-label="Buscar por nome, descrição ou tag"
            value={filtros.busca}
            onChange={evento =>
              setFiltros({ ...filtros, busca: evento.target.value })
            }
          />
        </label>
        {!interno && (
          <button
            type="button"
            aria-pressed={filtros.soFavoritos}
            className={`${classes.toggle} ${
              filtros.soFavoritos ? classes.toggleAtivo : ''
            }`}
            onClick={() =>
              setFiltros({ ...filtros, soFavoritos: !filtros.soFavoritos })
            }
          >
            ★ Favoritos
          </button>
        )}
        {filtroTipo && (
          <FilterSelect
            label="Tipo"
            value={
              filtros.tipo ? ROTULO_TIPO[filtros.tipo] ?? filtros.tipo : ''
            }
            options={tipos.map(tipo => ROTULO_TIPO[tipo] ?? tipo)}
            onChange={rotulo =>
              setFiltros({
                ...filtros,
                tipo:
                  tipos.find(tipo => (ROTULO_TIPO[tipo] ?? tipo) === rotulo) ??
                  '',
              })
            }
          />
        )}
        <FilterSelect
          label="Dono"
          value={filtros.dono}
          options={donos}
          onChange={dono => setFiltros({ ...filtros, dono })}
        />
        <FilterSelect
          label="Ciclo de vida"
          value={filtros.ciclo}
          options={ciclos}
          onChange={ciclo => setFiltros({ ...filtros, ciclo })}
        />
        {temFiltro(filtros, filtrosColuna) && (
          <button
            type="button"
            className={classes.link}
            style={{
              height: 36,
              border: 0,
              background: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              setFiltros(SEM_FILTROS);
              setFiltrosColuna({});
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {!loading && !error && entidades.length === 0 && (
        <div className={classes.empty}>{vazio}</div>
      )}
      {!loading && !error && entidades.length > 0 && (
        <>
          <EntityTable
            titulo={titulo}
            entidades={paginar(filtradas, pagina, porPagina)}
            colunas={colunas}
            filtrosColuna={filtrosColuna}
            onFiltroColuna={onFiltroColuna}
            abrirDocs={docs}
            somenteLeitura={interno}
            ehFavorita={ehFavorita}
            onFavorito={entidade => toggleStarredEntity(entidade.ref)}
          />
          {filtradas.length === 0 && (
            <div className={classes.empty}>
              Nada encontrado com esses filtros.
            </div>
          )}
          {filtradas.length > 0 && (
            <TablePagination
              component="div"
              className={classes.pagination}
              count={filtradas.length}
              page={Math.min(
                pagina,
                Math.max(0, Math.ceil(filtradas.length / porPagina) - 1),
              )}
              rowsPerPage={porPagina}
              rowsPerPageOptions={[]}
              onPageChange={(_, nova) => setPagina(nova)}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count}`
              }
            />
          )}
        </>
      )}
    </section>
  );
}
