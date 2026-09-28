import { useMemo } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ResponseErrorPanel } from '@backstage/core-components';
import ArrowIcon from '@material-ui/icons/CallMade';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
  Pill,
  type BadgeVariant,
} from '@internal/plugin-components';

const KINDS = [
  { id: 'Todos', label: 'Todos', one: '' },
  { id: 'Component', label: 'Aplicações', one: 'Aplicação' },
  { id: 'Resource', label: 'Recursos', one: 'Recurso' },
  { id: 'API', label: 'APIs', one: 'API' },
  { id: 'System', label: 'Sistemas', one: 'Sistema' },
];

const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

/**
 * Catálogo em cartões — a alternativa em galeria à tabela. O que a tela deve
 * conter está em `README.md`.
 *
 * Mesma fonte de dados do catálogo oficial: é uma forma de ver, não um
 * catálogo paralelo. Duplicar a fonte criaria duas verdades.
 */
export function CatalogV2Page() {
  const catalogApi = useApi(catalogApiRef);
  const [params, setParams] = useSearchParams();
  const kind = params.get('kind') ?? 'Todos';
  const query = params.get('q') ?? '';

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: ['Component', 'Resource', 'API', 'System'] },
    });
    return items;
  }, [catalogApi]);

  const all = useMemo(() => value ?? [], [value]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todos: all.length };
    for (const e of all) c[e.kind] = (c[e.kind] ?? 0) + 1;
    return c;
  }, [all]);

  const entities = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all
      .filter(entity => {
        if (kind !== 'Todos' && entity.kind !== kind) return false;
        if (!term) return true;
        return `${entity.metadata.title ?? ''} ${entity.metadata.name} ${
          entity.metadata.description ?? ''
        } ${(entity.metadata.tags ?? []).join(' ')}`
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) =>
        (a.metadata.title ?? a.metadata.name).localeCompare(b.metadata.title ?? b.metadata.name),
      );
  }, [all, kind, query]);

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Descoberta"
      title="Catálogo V2"
      subtitle="Aplicações, recursos, APIs e sistemas registrados — em cartões."
      actions={
        <RouterLink className="atlas-btnPill" to="/catalog">
          Ver em tabela
        </RouterLink>
      }
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          {KINDS.map(k => (
            <Pill key={k.id} active={kind === k.id} onClick={() => setParam('kind', k.id, 'Todos')}>
              {k.label} {loading ? '' : `(${counts[k.id] ?? 0})`}
            </Pill>
          ))}
          <div className="atlas-searchFieldWrap" style={{ marginLeft: 'auto' }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar por nome, descrição ou tag"
              aria-label="Buscar"
              value={query}
              onChange={e => setParam('q', e.target.value, '')}
            />
          </div>
        </div>

        {loading ? (
          <CardGrid>
            {Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <article key={index} className="atlas-featureCard" aria-hidden>
                <div className="atlas-skeletonLine" style={{ width: '30%' }} />
                <div className="atlas-skeletonLine" style={{ width: '70%' }} />
                <div className="atlas-skeletonLine" style={{ width: '90%' }} />
              </article>
            ))}
          </CardGrid>
        ) : entities.length === 0 ? (
          <div className="atlas-emptyState">
            {all.length === 0
              ? 'O catálogo está vazio. Registre um componente com um template em Create.'
              : 'Nada encontrado com esse filtro.'}
          </div>
        ) : (
          <CardGrid>
            {entities.map(entity => {
              const spec = entity.spec as { type?: string; lifecycle?: string; owner?: string };
              const lifecycle = String(spec?.lifecycle ?? '');
              const namespace = entity.metadata.namespace ?? 'default';
              const path = `/catalog/${namespace}/${entity.kind.toLowerCase()}/${entity.metadata.name}`;
              const owner = String(spec?.owner ?? '').replace(/^group:(default\/)?/, '');

              return (
                <FeatureCard
                  key={`${entity.kind}:${namespace}:${entity.metadata.name}`}
                  title={entity.metadata.title ?? entity.metadata.name}
                  badge={
                    <span style={{ display: 'flex', gap: 6 }}>
                      <Badge variant="info">{KINDS.find(k => k.id === entity.kind)?.one ?? entity.kind}</Badge>
                      {lifecycle && (
                        <Badge variant={LIFECYCLE_VARIANT[lifecycle] ?? 'info'}>{lifecycle}</Badge>
                      )}
                    </span>
                  }
                  body={entity.metadata.description ?? 'Sem descrição.'}
                  footer={
                    <>
                      {spec?.type && <span className="atlas-tagChip">{spec.type}</span>}
                      {owner && <span className="atlas-tagChip">{owner}</span>}
                      <RouterLink
                        className="atlas-templateLink"
                        to={path}
                        style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        Abrir <ArrowIcon style={{ fontSize: 13 }} />
                      </RouterLink>
                    </>
                  }
                />
              );
            })}
          </CardGrid>
        )}
      </section>
    </AtlasPage>
  );
}
