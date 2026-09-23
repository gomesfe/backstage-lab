import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import ArrowIcon from '@material-ui/icons/CallMade';
import { atlasTokens } from '@internal/plugin-components';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
} from '@internal/plugin-components';
import type { BadgeVariant } from '@internal/plugin-components';

const KINDS = ['Todos', 'Component', 'Resource', 'API', 'System'];

/** Ciclo de vida → cor da etiqueta, como no redesign. */
const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

const useStyles = makeStyles(theme => ({
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: atlasTokens.radius.lg,
    padding: '10px 14px',
  },
  pill: {
    border: `1px solid ${theme.palette.divider}`,
    background: 'transparent',
    color: theme.palette.text.secondary,
    borderRadius: atlasTokens.radius.pill,
    padding: '6px 12px',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { background: theme.palette.action.hover },
  },
  pillActive: {
    background: atlasTokens.brand.lime,
    borderColor: atlasTokens.brand.lime,
    color: atlasTokens.brand.limeText,
    '&:hover': { background: atlasTokens.brand.lime },
  },
  search: { marginLeft: 'auto', minWidth: 220 },
  open: {
    marginLeft: 'auto',
    color: atlasTokens.brand.lime,
    cursor: 'pointer',
    fontWeight: 700,
  },
}));

/**
 * Catálogo em cartões, a alternativa do redesign à tabela padrão.
 *
 * Mesma fonte de dados do catálogo oficial — é uma forma de ver, não um
 * catálogo paralelo. Duplicar a fonte criaria duas verdades.
 */
export function CatalogV2Page() {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const navigate = useNavigate();
  const [kind, setKind] = useState('Todos');
  const [query, setQuery] = useState('');

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'Resource', 'API', 'System'] },
    });
    return items;
  }, [catalogApi]);

  const entities = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (value ?? []).filter(entity => {
      if (kind !== 'Todos' && entity.kind !== kind) return false;
      if (!term) return true;
      const haystack = `${entity.metadata.name} ${
        entity.metadata.description ?? ''
      } ${(entity.metadata.tags ?? []).join(' ')}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [value, kind, query]);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Descoberta"
      title="Catálogo"
      subtitle="Todos os componentes, recursos e APIs registrados, em cartões."
    >
      <div className={classes.filters}>
        {KINDS.map(k => (
          <button
            key={k}
            type="button"
            className={`${classes.pill} ${kind === k ? classes.pillActive : ''}`}
            onClick={() => setKind(k)}
          >
            {k}
          </button>
        ))}
        <TextField
          className={classes.search}
          size="small"
          variant="outlined"
          placeholder="Buscar por nome, descrição ou tag"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </div>

      {entities.length === 0 ? (
        <FeatureCard
          title="Nada encontrado"
          body="Ajuste o filtro, ou registre um componente novo em Create."
        />
      ) : (
        <CardGrid>
          {entities.map(entity => {
            const spec = entity.spec as {
              type?: string;
              lifecycle?: string;
              owner?: string;
            };
            const lifecycle = String(spec?.lifecycle ?? '');
            const path = `/catalog/${entity.metadata.namespace ?? 'default'}/${entity.kind.toLowerCase()}/${entity.metadata.name}`;

            return (
              <FeatureCard
                key={`${entity.kind}:${entity.metadata.name}`}
                title={entity.metadata.title ?? entity.metadata.name}
                badge={
                  lifecycle ? (
                    <Badge variant={LIFECYCLE_VARIANT[lifecycle] ?? 'info'}>
                      {lifecycle}
                    </Badge>
                  ) : (
                    <Badge variant="info">{entity.kind}</Badge>
                  )
                }
                body={entity.metadata.description ?? 'Sem descrição.'}
                footer={
                  <>
                    <span>{spec?.type ?? entity.kind.toLowerCase()}</span>
                    <span>
                      {String(spec?.owner ?? '—').replace(
                        /^group:default\//,
                        '',
                      )}
                    </span>
                    <span
                      className={classes.open}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(path)}
                      onKeyDown={e => e.key === 'Enter' && navigate(path)}
                    >
                      Abrir{' '}
                      <ArrowIcon style={{ fontSize: 13, verticalAlign: -2 }} />
                    </span>
                  </>
                }
              />
            );
          })}
        </CardGrid>
      )}
    </AtlasPage>
  );
}
