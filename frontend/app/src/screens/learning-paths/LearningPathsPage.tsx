import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import LayersIcon from '@material-ui/icons/Layers';
import ArrowIcon from '@material-ui/icons/CallMade';
import BackIcon from '@material-ui/icons/ArrowBack';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
  Modal,
  type BadgeVariant,
} from '@internal/plugin-components';
import { LEARNING_PATHS, LEARNING_TAGS, type LearningStep } from './learningData';
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
      crumb="Trilhas"
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

/** O texto completo de uma etapa, no pop-up. */
function StepContent({ step }: { step: LearningStep }) {
  return (
    <div className="atlas-prose">
      <p>{step.desc}</p>
      {step.content?.map(block => (
        <section key={block.heading}>
          <h4>{block.heading}</h4>
          {block.paragraphs?.map(p => (
            <p key={p}>{p}</p>
          ))}
          {block.items && (
            <ul>
              {block.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

/**
 * Detalhe de uma trilha: as etapas, em ordem. Clicar numa etapa abre o texto
 * dela; é lá que se marca como concluída e se passa para a próxima.
 */
export function LearningPathDetailPage() {
  const { pathId } = useParams();
  const { doneIn, toggle, reset } = useProgress();
  const path = LEARNING_PATHS.find(p => p.id === pathId);
  const [openStep, setOpenStep] = useState<string | null>(null);

  if (!path) {
    return (
      <AtlasPage
        eyebrow="Aprendizado"
        title="Trilha não encontrada"
        subtitle="O endereço não corresponde a nenhuma trilha."
        parents={[{ label: 'Trilhas', to: '/learning-paths' }]}
        actions={
          <RouterLink className="atlas-btnPill" to="/learning-paths">
            <BackIcon style={{ fontSize: 15 }} /> Voltar para trilhas
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
  // Próxima trilha sugerida ao terminar: a seguinte na lista que não esteja concluída.
  const pathIndex = LEARNING_PATHS.findIndex(p => p.id === path.id);
  const nextPath = [...LEARNING_PATHS.slice(pathIndex + 1), ...LEARNING_PATHS.slice(0, pathIndex)].find(
    p => p.steps.some(step => !doneIn(p.id).has(step.id)),
  );

  return (
    <AtlasPage
      eyebrow={`Trilha · ${path.difficulty}`}
      title={path.title}
      subtitle={path.description}
      parents={[{ label: 'Trilhas', to: '/learning-paths' }]}
      actions={
        <>
          <RouterLink className="atlas-btnPill" to="/learning-paths">
            <BackIcon style={{ fontSize: 15 }} /> Voltar para trilhas
          </RouterLink>
          {doneCount > 0 && (
            <button type="button" className="atlas-btnPill atlas-btnGhost" onClick={() => reset(path.id)}>
              Recomeçar
            </button>
          )}
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
                onClick={() => setOpenStep(step.id)}
              >
                <span className="atlas-stepCheck">{isDone ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>
                  <span className="atlas-infoItemTitle">
                    {index + 1}. {step.title}
                  </span>
                  <br />
                  <span className="atlas-infoItemDesc">{step.desc}</span>
                </span>
                <span className="atlas-templateLink" style={{ fontSize: '0.78rem', alignSelf: 'center' }}>
                  Ler <ArrowIcon style={{ fontSize: 12 }} />
                </span>
              </button>
            );
          })}
        </div>
        {doneCount === path.steps.length ? (
          <div className="atlas-alert atlas-alertSuccess" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="atlas-alertTitle">Trilha concluída</div>
              {nextPath ? `Próxima sugestão: ${nextPath.title}.` : 'Você concluiu todas as trilhas.'}
            </div>
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <RouterLink className="atlas-btnPill" to="/learning-paths">
                <BackIcon style={{ fontSize: 15 }} /> Voltar para trilhas
              </RouterLink>
              {nextPath && (
                <RouterLink className="atlas-btnPill atlas-btnPillLime" to={`/learning-paths/${nextPath.id}`}>
                  Próxima trilha <ArrowIcon style={{ fontSize: 13 }} />
                </RouterLink>
              )}
            </span>
          </div>
        ) : (
          <p className="atlas-text">Clique numa etapa para ler e marcá-la como concluída.</p>
        )}
      </section>

      {(() => {
        const index = path.steps.findIndex(s => s.id === openStep);
        const step = path.steps[index];
        const previous = path.steps[index - 1];
        const next = path.steps[index + 1];
        const stepDone = step ? done.has(step.id) : false;
        return (
          <Modal
            open={Boolean(step)}
            onClose={() => setOpenStep(null)}
            wide
            title={step ? `${index + 1}. ${step.title}` : ''}
            footer={
              step && (
                <>
                  <button
                    type="button"
                    className="atlas-btnPill"
                    style={{ marginRight: 'auto' }}
                    disabled={!previous}
                    onClick={() => previous && setOpenStep(previous.id)}
                  >
                    <BackIcon style={{ fontSize: 15 }} /> Etapa anterior
                  </button>
                  <button type="button" className="atlas-btnPill" onClick={() => toggle(path.id, step.id)}>
                    {stepDone ? 'Desmarcar' : 'Marcar como concluída'}
                  </button>
                  {next ? (
                    <button
                      type="button"
                      className="atlas-btnPill atlas-btnPillLime"
                      onClick={() => {
                        if (!stepDone) toggle(path.id, step.id);
                        setOpenStep(next.id);
                      }}
                    >
                      {stepDone ? 'Próxima etapa' : 'Concluir e seguir'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="atlas-btnPill atlas-btnPillLime"
                      onClick={() => {
                        if (!stepDone) toggle(path.id, step.id);
                        setOpenStep(null);
                      }}
                    >
                      {stepDone ? 'Fechar' : 'Concluir trilha'}
                    </button>
                  )}
                </>
              )
            }
          >
            {step && <StepContent step={step} />}
          </Modal>
        );
      })()}
    </AtlasPage>
  );
}
