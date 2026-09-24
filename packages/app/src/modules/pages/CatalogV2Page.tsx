import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useNavigate } from 'react-router-dom';
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

const KINDS = ['Todos', 'Component', 'Resource', 'API', 'System'];

/** Ciclo de vida → cor da etiqueta, como no redesign. */
const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

/**
 * Catálogo em cartões, portado de `CatalogV2Page.tsx` do redesign — a
 * alternativa em galeria à tabela padrão.
 *
 * Mesma fonte de dados do catálogo oficial — é uma forma de ver, não um
 * catálogo paralelo. Duplicar a fonte criaria duas verdades.
 */
export function CatalogV2Page() {
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

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Descoberta"
      title="Catálogo"
      subtitle="Todos os componentes, recursos e APIs registrados, em cartões."
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          {KINDS.map(k => (
            <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
              {k}
            </Pill>
          ))}
          <div className="atlas-searchFieldWrap" style={{ marginLeft: 'auto' }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar por nome, descrição ou tag"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="atlas-skeletonLine" style={{ width: `${85 - index * 10}%` }} />
            ))}
          </div>
        ) : entities.length === 0 ? (
          <div className="atlas-emptyState">
            Nada encontrado. Ajuste o filtro, ou registre um componente novo em Create.
          </div>
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
                      <a
                        className="atlas-templateLink"
                        style={{
                          marginLeft: 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onClick={() => navigate(path)}
                      >
                        Abrir <ArrowIcon style={{ fontSize: 13 }} />
                      </a>
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
