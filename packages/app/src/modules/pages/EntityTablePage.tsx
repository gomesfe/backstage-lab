import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import OpenIcon from '@material-ui/icons/OpenInNew';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ResponseErrorPanel } from '@backstage/core-components';
import {
  AtlasPage,
  Badge,
  DataTable,
  type BadgeVariant,
  type Column,
} from '@internal/plugin-components';
import type { Entity } from '@backstage/catalog-model';

const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

export type EntityRow = {
  id: string;
  name: string;
  description: string;
  owner: string;
  type: string;
  lifecycle: string;
  tags: string[];
  path: string;
};

/**
 * Lista de entidades do catálogo em tabela, com filtros — portada de
 * `CatalogPage.tsx`/`ApisPage.tsx`/`DocsPage.tsx` do redesign, que são a
 * mesma tela com um filtro de kind diferente. Uma implementação só evita que
 * os filtros e as colunas divirjam entre elas com o tempo.
 */
export function EntityTablePage({
  eyebrow,
  title,
  subtitle,
  kinds,
  emptyMessage,
  requireTechdocs = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  kinds: string[];
  emptyMessage: string;
  requireTechdocs?: boolean;
}) {
  const catalogApi = useApi(catalogApiRef);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState('Todos');
  const [tag, setTag] = useState('Todas');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({ filter: { kind: kinds } });
    return items;
  }, [catalogApi, kinds.join(',')]);

  const entities: Entity[] = useMemo(() => {
    const all = value ?? [];
    if (!requireTechdocs) return all;
    // Docs lista só quem publica TechDocs — sem a anotação não há o que abrir.
    return all.filter(
      e => e.metadata.annotations?.['backstage.io/techdocs-ref'],
    );
  }, [value, requireTechdocs]);

  const owners = useMemo(
    () =>
      [
        ...new Set(
          entities.map(e =>
            String((e.spec as { owner?: string })?.owner ?? '').replace(
              /^group:default\//,
              '',
            ),
          ),
        ),
      ]
        .filter(Boolean)
        .sort(),
    [entities],
  );

  const tags = useMemo(
    () => [...new Set(entities.flatMap(e => e.metadata.tags ?? []))].sort(),
    [entities],
  );

  const rows: EntityRow[] = useMemo(() => {
    const term = query.trim().toLowerCase();

    return entities
      .map(entity => {
        const spec = entity.spec as {
          type?: string;
          lifecycle?: string;
          owner?: string;
        };
        return {
          id: `${entity.kind}:${entity.metadata.namespace ?? 'default'}:${entity.metadata.name}`,
          name: entity.metadata.title ?? entity.metadata.name,
          description: entity.metadata.description ?? '—',
          owner: String(spec?.owner ?? '—').replace(/^group:default\//, ''),
          type: spec?.type ?? entity.kind.toLowerCase(),
          lifecycle: spec?.lifecycle ?? '',
          tags: entity.metadata.tags ?? [],
          path: `/catalog/${entity.metadata.namespace ?? 'default'}/${entity.kind.toLowerCase()}/${entity.metadata.name}`,
        };
      })
      .filter(row => {
        if (owner !== 'Todos' && row.owner !== owner) return false;
        if (tag !== 'Todas' && !row.tags.includes(tag)) return false;
        if (!term) return true;
        return `${row.name} ${row.description} ${row.tags.join(' ')}`
          .toLowerCase()
          .includes(term);
      });
  }, [entities, query, owner, tag]);

  const columns: Column<EntityRow>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: row => <span className="atlas-resourceCell">{row.name}</span>,
    },
    { key: 'description', header: 'Descrição', render: row => (
      <span className="atlas-cellMuted">{row.description}</span>
    ) },
    { key: 'owner', header: 'Dono', render: row => row.owner },
    { key: 'type', header: 'Tipo', render: row => row.type },
    {
      key: 'lifecycle',
      header: 'Ciclo de vida',
      render: row =>
        row.lifecycle ? (
          <Badge variant={LIFECYCLE_VARIANT[row.lifecycle] ?? 'info'}>
            {row.lifecycle}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: row => (
        <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {row.tags.map(t => (
            <span key={t} className="atlas-tagChip">
              {t}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: row => (
        <span className="atlas-tableActionGroup" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="atlas-actionBtnLink"
            title="Favoritar"
            style={
              favorites[row.id] ? { color: 'var(--warning)' } : undefined
            }
            onClick={() =>
              setFavorites(current => ({
                ...current,
                [row.id]: !current[row.id],
              }))
            }
          >
            {favorites[row.id] ? (
              <StarIcon style={{ fontSize: 14 }} />
            ) : (
              <StarBorderIcon style={{ fontSize: 14 }} />
            )}
          </button>
          <button
            type="button"
            className="atlas-actionBtnLink"
            title="Abrir"
            onClick={() => navigate(row.path)}
          >
            <OpenIcon style={{ fontSize: 14 }} />
          </button>
        </span>
      ),
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          <div className="atlas-searchFieldWrap">
            <input
              className="atlas-filterInput"
              placeholder="Buscar por nome, descrição ou tag"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <span className="atlas-paginationInfo" style={{ marginLeft: 'auto' }}>
            {rows.length} item(ns)
          </span>
        </div>

        <div className="atlas-filtersBar atlas-filtersBarWrap">
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Dono</span>
            <select
              className="atlas-filterSelect"
              value={owner}
              onChange={e => setOwner(e.target.value)}
            >
              {['Todos', ...owners].map(o => (
                <option key={o} value={o}>
                  {o}
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
              {['Todas', ...tags].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          emptyMessage={emptyMessage}
        />
      </section>
    </AtlasPage>
  );
}
