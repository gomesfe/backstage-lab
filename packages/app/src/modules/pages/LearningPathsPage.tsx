import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';
import CircleIcon from '@material-ui/icons/RadioButtonUnchecked';
import LayersIcon from '@material-ui/icons/Layers';
import ArrowIcon from '@material-ui/icons/CallMade';
import { atlasTokens } from '@internal/plugin-components';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
} from '@internal/plugin-components';
import type { BadgeVariant } from '@internal/plugin-components';
import { LEARNING_PATHS, LEARNING_TAGS } from './learningData';

const { brand, radius } = atlasTokens;

const DIFFICULTY_VARIANT: Record<string, BadgeVariant> = {
  Iniciante: 'lime',
  Intermediário: 'info',
  Avançado: 'purple',
};

const DIFFICULTIES = ['Todas', 'Iniciante', 'Intermediário', 'Avançado'];

const useStyles = makeStyles(theme => ({
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '10px 14px',
  },
  search: { minWidth: 240, flex: 1 },
  select: { minWidth: 160 },
  open: {
    marginLeft: 'auto',
    color: brand.lime,
    cursor: 'pointer',
    fontWeight: 700,
  },
  step: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '14px 0',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 0 },
  },
  stepTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    margin: 0,
  },
  stepDesc: {
    fontSize: '0.82rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    margin: '2px 0 0',
  },
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '8px 20px',
  },
}));

export function LearningPathsPage() {
  const classes = useStyles();
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
      <div className={classes.filters}>
        <TextField
          className={classes.search}
          size="small"
          variant="outlined"
          placeholder="Buscar trilha…"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <TextField
          className={classes.select}
          select
          size="small"
          variant="outlined"
          label="Dificuldade"
          value={difficulty}
          onChange={event => setDifficulty(event.target.value)}
        >
          {DIFFICULTIES.map(d => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          className={classes.select}
          select
          size="small"
          variant="outlined"
          label="Tag"
          value={tag}
          onChange={event => setTag(event.target.value)}
        >
          {['Todas', ...LEARNING_TAGS].map(t => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {paths.length === 0 ? (
        <FeatureCard title="Nenhuma trilha" body="Ajuste os filtros acima." />
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
                  <span>
                    <LayersIcon style={{ fontSize: 13, verticalAlign: -2 }} />{' '}
                    {path.steps.length} etapas
                  </span>
                  <span>{path.tags.join(' · ')}</span>
                  <span
                    className={classes.open}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/learning-paths/${path.id}`)}
                    onKeyDown={e =>
                      e.key === 'Enter' && navigate(`/learning-paths/${path.id}`)
                    }
                  >
                    Abrir{' '}
                    <ArrowIcon style={{ fontSize: 13, verticalAlign: -2 }} />
                  </span>
                </>
              }
            />
          ))}
        </CardGrid>
      )}
    </AtlasPage>
  );
}

/** Detalhe de uma trilha: os passos, em ordem. */
export function LearningPathDetailPage() {
  const classes = useStyles();
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
          <Button variant="outlined" onClick={() => navigate('/learning-paths')}>
            Ver todas
          </Button>
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
        <Button variant="outlined" onClick={() => navigate('/learning-paths')}>
          Voltar
        </Button>
      }
    >
      <div className={classes.card}>
        {path.steps.map(step => (
          <div key={step.id} className={classes.step}>
            {step.done ? (
              <CheckIcon style={{ color: brand.lime }} />
            ) : (
              <CircleIcon color="disabled" />
            )}
            <div>
              <h4 className={classes.stepTitle}>{step.title}</h4>
              <p className={classes.stepDesc}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </AtlasPage>
  );
}
