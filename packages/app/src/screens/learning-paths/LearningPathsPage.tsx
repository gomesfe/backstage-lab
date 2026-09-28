import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
import { useProgress } from './useProgress';

const DIFFICULTY_VARIANT: Record<string, BadgeVariant> = {
  Iniciante: 'lime',
  Intermediário: 'info',
  Avançado: 'purple',
};

const DIFFICULTIES = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="atlas-progressLabel">
        <span>{done === total && total > 0 ? 'Concluída' : 'Progresso'}</span>
        <span>
          {done} de {total}
        </span>
      </div>
      <div
        className="atlas-progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="atlas-progressBar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Lista de trilhas. O que a tela deve conter está em `README.md`. */
export function LearningPathsPage() {
  const { doneIn } = useProgress();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('Todas');
  const [tag, setTag] = useState('Todas');

  const paths = useMemo(() => {
    const term = query.trim().toLowerCase();
    return LEARNING_PATHS.filter(path => {
      const matchesQuery =
        !term ||
        `${path.title} ${path.description} ${path.tags.join(' ')}`.toLowerCase().includes(term);
      const matchesDifficulty = difficulty === 'Todas' || path.difficulty === difficulty;
      const matchesTag = tag === 'Todas' || path.tags.includes(tag);
      return matchesQuery && matchesDifficulty && matchesTag;
    });
  }, [query, difficulty, tag]);

  return (
    <AtlasPage
      eyebrow="Aprendizado"
      title="Trilhas de aprendizado"
      subtitle="Trilhas guiadas para dominar o Atlas e as práticas de engenharia da casa. Seu progresso fica salvo."
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          <div className="atlas-searchFieldWrap" style={{ flex: 1 }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar trilha"
              aria-label="Buscar trilha"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Dificuldade</span>
            <select className="atlas-filterSelect" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Tema</span>
            <select className="atlas-filterSelect" value={tag} onChange={e => setTag(e.target.value)}>
              {['Todas', ...LEARNING_TAGS].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {paths.length === 0 ? (
          <div className="atlas-emptyState">Nenhuma trilha com esses filtros.</div>
        ) : (
          <CardGrid>
            {paths.map(path => {
              const done = [...doneIn(path.id)].filter(id => path.steps.some(s => s.id === id)).length;
              const started = done > 0;
              return (
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
                      <span className="atlas-tagChip">
                        <LayersIcon style={{ fontSize: 12, verticalAlign: -2 }} /> {path.steps.length} etapas
                      </span>
                      {path.tags.slice(0, 2).map(t => (
                        <span key={t} className="atlas-tagChip">{t}</span>
                      ))}
                      <RouterLink
                        className={`atlas-btnPill ${started ? '' : 'atlas-btnPillLime'}`}
                        style={{ marginLeft: 'auto' }}
                        to={`/learning-paths/${path.id}`}
                      >
                        {done === path.steps.length ? 'Revisar' : started ? 'Continuar' : 'Começar'}
                      </RouterLink>
                    </>
                  }
                >
                  <ProgressBar done={done} total={path.steps.length} />
                </FeatureCard>
              );
            })}
          </CardGrid>
        )}
      </section>
    </AtlasPage>
  );
}

/** Detalhe de uma trilha: as etapas, em ordem, marcáveis. */
export function LearningPathDetailPage() {
  const { pathId } = useParams();
  const { doneIn, toggle, reset } = useProgress();
  const path = LEARNING_PATHS.find(p => p.id === pathId);

  if (!path) {
    return (
      <AtlasPage
        eyebrow="Aprendizado"
        title="Trilha não encontrada"
        subtitle="O endereço não corresponde a nenhuma trilha."
        actions={
          <RouterLink className="atlas-btnPill" to="/learning-paths">
            Ver todas as trilhas
          </RouterLink>
        }
      >
        <span />
      </AtlasPage>
    );
  }

  const done = doneIn(path.id);
  const doneCount = path.steps.filter(s => done.has(s.id)).length;
  const nextId = path.steps.find(s => !done.has(s.id))?.id;

  return (
    <AtlasPage
      eyebrow={`Trilha · ${path.difficulty}`}
      title={path.title}
      subtitle={path.description}
      actions={
        <>
          {doneCount > 0 && (
            <button type="button" className="atlas-btnPill" onClick={() => reset(path.id)}>
              Recomeçar
            </button>
          )}
          <RouterLink className="atlas-btnPill" to="/learning-paths">
            Todas as trilhas
          </RouterLink>
        </>
      }
    >
      <section className="atlas-sectionCard">
        <ProgressBar done={doneCount} total={path.steps.length} />
        <div className="atlas-stepList">
          {path.steps.map((step, index) => {
            const isDone = done.has(step.id);
            return (
              <button
                key={step.id}
                type="button"
                aria-pressed={isDone}
                className={[
                  'atlas-stepItem',
                  isDone ? 'atlas-stepItemDone' : '',
                  step.id === nextId ? 'atlas-stepItemNext' : '',
                ].join(' ')}
                onClick={() => toggle(path.id, step.id)}
              >
                <span className="atlas-stepCheck">{isDone ? '✓' : ''}</span>
                <span>
                  <span className="atlas-infoItemTitle">
                    {index + 1}. {step.title}
                  </span>
                  <br />
                  <span className="atlas-infoItemDesc">{step.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        {doneCount === path.steps.length ? (
          <div className="atlas-alert atlas-alertSuccess">
            <div>
              <div className="atlas-alertTitle">Trilha concluída</div>
              Veja outras trilhas para continuar.{' '}
              <RouterLink className="atlas-templateLink" to="/learning-paths">
                Ver trilhas <ArrowIcon style={{ fontSize: 12 }} />
              </RouterLink>
            </div>
          </div>
        ) : (
          <p className="atlas-text">Clique numa etapa para marcá-la como feita.</p>
        )}
      </section>
    </AtlasPage>
  );
}
