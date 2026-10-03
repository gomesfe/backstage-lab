import { useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Content, Page } from '@backstage/core-components';
import { distintos } from '../shared/filtros';
import { FilterSelect } from '../shared/FilterSelect';
import { PathCard } from './PathCard';
import { TRILHAS } from './data';
import { useProgresso } from './hooks/useProgresso';
import { contarFeitas, DIFICULDADES, filtrarTrilhas } from './helpers';
import { useStyles } from './styles';
import type { Filtros } from './types';

/** Lista de trilhas, com busca, dificuldade, tema e o progresso de cada uma. */
export function LearningPathsPage() {
  const classes = useStyles();
  const { hash } = useLocation();
  const { feitasEm } = useProgresso();
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    dificuldade: '',
    tema: '',
  });

  const temas = useMemo(
    () => distintos(TRILHAS.flatMap(trilha => trilha.temas)),
    [],
  );
  const filtradas = useMemo(() => filtrarTrilhas(TRILHAS, filtros), [filtros]);

  // Links antigos (/learning-paths#<id>) vão para o detalhe da trilha.
  const daAncora = TRILHAS.find(trilha => `#${trilha.id}` === hash);
  if (daAncora)
    return <Navigate to={`/learning-paths/${daAncora.id}`} replace />;

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Aprendizado</span>
              <h1 className={classes.title}>Trilhas de aprendizado</h1>
              <p className={classes.subtitle}>
                Trilhas guiadas para dominar o Atlas e as práticas de engenharia
                da casa. Seu progresso fica salvo.
              </p>
            </div>
          </div>

          <section className={classes.card}>
            <div className={classes.filters}>
              <label className={classes.search}>
                <SearchIcon style={{ fontSize: 18 }} />
                <input
                  type="search"
                  placeholder="Buscar trilha"
                  aria-label="Buscar trilha"
                  value={filtros.busca}
                  onChange={event =>
                    setFiltros({ ...filtros, busca: event.target.value })
                  }
                />
              </label>
              <FilterSelect
                label="Dificuldade"
                value={filtros.dificuldade}
                options={DIFICULDADES}
                allLabel="Todas"
                onChange={dificuldade =>
                  setFiltros({ ...filtros, dificuldade })
                }
              />
              <FilterSelect
                label="Tema"
                value={filtros.tema}
                options={temas}
                allLabel="Todos"
                onChange={tema => setFiltros({ ...filtros, tema })}
              />
            </div>

            {filtradas.length > 0 ? (
              <div className={classes.grid}>
                {filtradas.map(trilha => (
                  <PathCard
                    key={trilha.id}
                    trilha={trilha}
                    feitas={contarFeitas(trilha, feitasEm(trilha.id))}
                  />
                ))}
              </div>
            ) : (
              <div className={classes.empty}>
                Nenhuma trilha com esses filtros.
              </div>
            )}
          </section>
        </div>
      </Content>
    </Page>
  );
}
