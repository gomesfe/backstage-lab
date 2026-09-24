import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CheckIcon from '@material-ui/icons/CheckCircle';
import CircleIcon from '@material-ui/icons/RadioButtonUnchecked';
import LayersIcon from '@material-ui/icons/Layers';
import ArrowIcon from '@material-ui/icons/CallMade';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
  type BadgeVariant,
} from '@internal/plugin-components';
import { LEARNING_PATHS, LEARNING_TAGS } from './learningData';

const DIFFICULTY_VARIANT: Record<string, BadgeVariant> = {
  Iniciante: 'lime',
  Intermediário: 'info',
  Avançado: 'purple',
};

const DIFFICULTIES = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];

/**
 * Trilhas de aprendizado, portada de `LearningPathsPage.tsx` do redesign —
 * usando `atlas-filtersBar`, `atlas-filterInput`/`atlas-filterSelect` e
 * `atlas-cardGrid` em vez de campos MUI.
 */
export function LearningPathsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('Todas');
  const [tag, setTag] = useState('Todas');

  const paths = useMemo(
    () =>
      LEARNING_PATHS.filter(path => {
        const matchesQuery = path.title
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesDifficulty =
          difficulty === 'Todas' || path.difficulty === difficulty;
        const matchesTag = tag === 'Todas' || path.tags.includes(tag);
        return matchesQuery && matchesDifficulty && matchesTag;
      }),
    [query, difficulty, tag],
  );

  return (
    <AtlasPage
      eyebrow="Aprendizado"
      title="Trilhas de aprendizado"
      subtitle="Trilhas guiadas para dominar o Atlas e as práticas de engenharia da casa."
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          <div className="atlas-searchFieldWrap">
            <input
              className="atlas-filterInput"
              placeholder="Buscar trilha…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Dificuldade</span>
            <select
              className="atlas-filterSelect"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Tag</span>
            <select
              className="atlas-filterSelect"
              value={tag}
              onChange={e => setTag(e.target.value)}
            >
              {['Todas', ...LEARNING_TAGS].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        {paths.length === 0 ? (
          <div className="atlas-emptyState">Ajuste os filtros acima.</div>
        ) : (
          <CardGrid>
            {paths.map(path => (
              <FeatureCard
                key={path.id}
                title={path.title}
                badge={
                  <Badge variant={DIFFICULTY_VARIANT[path.difficulty] ?? 'info'}>
                    {path.difficulty}
                  </Badge>
                }
                body={path.description}
                footer={
                  <>
                    <span className="atlas-paginationInfo">
                      <LayersIcon style={{ fontSize: 13 }} /> {path.steps.length} etapas
                    </span>
                    <span className="atlas-paginationInfo">{path.tags.join(' · ')}</span>
                    <a
                      className="atlas-templateLink"
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onClick={() => navigate(`/learning-paths/${path.id}`)}
                    >
                      Abrir <ArrowIcon style={{ fontSize: 13 }} />
                    </a>
                  </>
                }
              />
            ))}
          </CardGrid>
        )}
      </section>
    </AtlasPage>
  );
}

/** Detalhe de uma trilha: os passos, em ordem. */
export function LearningPathDetailPage() {
  const navigate = useNavigate();
  const { pathId } = useParams();
  const path = LEARNING_PATHS.find(p => p.id === pathId);

  if (!path) {
    return (
      <AtlasPage
        eyebrow="Aprendizado"
        title="Trilha não encontrada"
        subtitle="O identificador informado não corresponde a nenhuma trilha."
        actions={
          <button
            type="button"
            className="atlas-btnPill"
            onClick={() => navigate('/learning-paths')}
          >
            Ver todas
          </button>
        }
      >
        <span />
      </AtlasPage>
    );
  }

  return (
    <AtlasPage
      eyebrow="Trilha"
      title={path.title}
      subtitle={path.description}
      actions={
        <button
          type="button"
          className="atlas-btnPill"
          onClick={() => navigate('/learning-paths')}
        >
          Voltar
        </button>
      }
    >
      <section className="atlas-tableContainerCard">
        {path.steps.map(step => (
          <div key={step.id} className="atlas-infoItem">
            {step.done ? (
              <CheckIcon style={{ color: 'var(--lime)' }} />
            ) : (
              <CircleIcon style={{ color: 'var(--text-muted)' }} />
            )}
            <div>
              <div className="atlas-infoItemTitle">{step.title}</div>
              <div className="atlas-infoItemDesc">{step.desc}</div>
            </div>
          </div>
        ))}
      </section>
    </AtlasPage>
  );
}
