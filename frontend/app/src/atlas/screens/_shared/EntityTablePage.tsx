import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import OpenIcon from '@material-ui/icons/OpenInNew';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { stringifyEntityRef, type Entity } from '@backstage/catalog-model';
import { ResponseErrorPanel } from '@backstage/core-components';
import {
  AtlasPage,
  Badge,
  DataTable,
  Pagination,
  Pill,
  type BadgeVariant,
  type Column,
} from '../../components';

const LIFECYCLE_VARIANT: Record<string, BadgeVariant> = {
  production: 'lime',
  experimental: 'purple',
  deprecated: 'danger',
};

const KIND_LABEL: Record<string, string> = {
  Component: 'Aplicação',
  System: 'Sistema',
  Resource: 'Recurso',
  API: 'API',
  Group: 'Squad',
};

const PAGE_SIZE = 20;

type EntityRow = {
  id: string;
  ref: string;
  name: string;
  description: string;
  owner: string;
  kind: string;
  type: string;
  lifecycle: string;
  tags: string[];
  path: string;
};

/**
 * Tabela de entidades do catálogo — a base das telas Catálogo, APIs e Docs,
 * que no redesign são a mesma tela com um filtro de kind diferente. Uma
 * implementação só evita que filtros e colunas divirjam entre elas.
 *
 * Os filtros vivem na URL (`?kind=`, `?owner=`, `?q=`): a Home e Meus grupos
 * mandam para cá já filtrado, e o link filtrado pode ser compartilhado.
 *
 * Favoritos usam a API de entidades favoritas do Backstage — ficam salvos
 * por usuário, e são os mesmos da página da entidade.
 */
export function EntityTablePage({
  eyebrow,
  title,
  subtitle,
  kinds,
  emptyMessage,
  requireTechdocs = false,
  openIn = 'entity',
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  kinds: string[];
  emptyMessage: string;
  requireTechdocs?: boolean;
  /** Para onde o nome leva: a página da entidade, ou direto à documentação. */
  openIn?: 'entity' | 'docs';
}) {
  const catalogApi = useApi(catalogApiRef);
  const { isStarredEntity, toggleStarredEntity } = useStarredEntities();
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const kind = params.get('kind') ?? 'Todos';
  const owner = params.get('owner') ?? 'Todos';
  const tag = params.get('tag') ?? 'Todas';
  const onlyStarred = params.get('fav') === '1';
  const [page, setPage] = useState(1);

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const hasFilters = Boolean(
    query || kind !== 'Todos' || owner !== 'Todos' || tag !== 'Todas' || onlyStarred,
  );

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({ filter: { kind: kinds } });
    return items;
  }, [catalogApi, kinds.join(',')]);

  const entities: Entity[] = useMemo(() => {
    const all = value ?? [];
    if (!requireTechdocs) return all;
    // Docs lista só quem publica TechDocs — sem a anotação não há o que abrir.
    return all.filter(e => e.metadata.annotations?.['backstage.io/techdocs-ref']);
  }, [value, requireTechdocs]);

  const ownerOf = (e: Entity) =>
    String((e.spec as { owner?: string })?.owner ?? '').replace(/^group:(default\/)?/, '');

  const owners = useMemo(
    () => [...new Set(entities.map(ownerOf))].filter(Boolean).sort(),
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
        const spec = entity.spec as { type?: string; lifecycle?: string };
        const namespace = entity.metadata.namespace ?? 'default';
        const kindPath = entity.kind.toLowerCase();
        return {
          id: `${entity.kind}:${namespace}:${entity.metadata.name}`,
          ref: stringifyEntityRef(entity),
          name: entity.metadata.title ?? entity.metadata.name,
          description: entity.metadata.description ?? '',
          owner: ownerOf(entity) || '—',
          kind: entity.kind,
          type: spec?.type ?? kindPath,
          lifecycle: spec?.lifecycle ?? '',
          tags: entity.metadata.tags ?? [],
          path:
            openIn === 'docs'
              ? `/docs/${namespace}/${kindPath}/${entity.metadata.name}`
              : `/catalog/${namespace}/${kindPath}/${entity.metadata.name}`,
        };
      })
      .filter(row => {
        if (kind !== 'Todos' && row.kind !== kind) return false;
        if (owner !== 'Todos' && row.owner !== owner) return false;
        if (tag !== 'Todas' && !row.tags.includes(tag)) return false;
        if (onlyStarred && !isStarredEntity(row.ref)) return false;
        if (!term) return true;
        return `${row.name} ${row.description} ${row.tags.join(' ')}`
          .toLowerCase()
          .includes(term);
      })
      // Favoritos primeiro; o resto em ordem alfabética.
      .sort(
        (a, b) =>
          Number(isStarredEntity(b.ref)) - Number(isStarredEntity(a.ref)) ||
          a.name.localeCompare(b.name),
      );
  }, [entities, query, kind, owner, tag, onlyStarred, isStarredEntity, openIn]);

  // Mudou o filtro, volta para a primeira página.
  useEffect(() => setPage(1), [query, kind, owner, tag, onlyStarred]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<EntityRow>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: row => (
        <RouterLink className="atlas-templateLink" to={row.path}>
          {row.name}
        </RouterLink>
      ),
    },
    {
      key: 'description',
      header: 'Descrição',
      render: row => <span className="atlas-cellMuted">{row.description || '—'}</span>,
    },
    ...(kinds.length > 1
      ? [{ key: 'kind', header: 'Tipo', render: (row: EntityRow) => KIND_LABEL[row.kind] ?? row.kind }]
      : []),
    { key: 'type', header: kinds.length > 1 ? 'Subtipo' : 'Tipo', render: row => row.type },
    { key: 'owner', header: 'Dono', render: row => row.owner },
    {
      key: 'lifecycle',
      header: 'Ciclo de vida',
      render: row =>
        row.lifecycle ? (
          <Badge variant={LIFECYCLE_VARIANT[row.lifecycle] ?? 'info'}>{row.lifecycle}</Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'tags',
      header: 'Tags',
      render: row => (
        <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {row.tags.slice(0, 3).map(t => (
            <span key={t} className="atlas-tagChip">{t}</span>
          ))}
          {row.tags.length > 3 && (
            <span className="atlas-tagChip" title={row.tags.slice(3).join(', ')}>
              +{row.tags.length - 3}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: row => {
        const starred = isStarredEntity(row.ref);
        return (
          <span className="atlas-tableActionGroup" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="atlas-actionBtnLink"
              aria-pressed={starred}
              aria-label={starred ? `Remover ${row.name} dos favoritos` : `Favoritar ${row.name}`}
              title={starred ? 'Remover dos favoritos' : 'Favoritar'}
              style={starred ? { color: 'var(--warning)' } : undefined}
              onClick={() => toggleStarredEntity(row.ref)}
            >
              {starred ? <StarIcon style={{ fontSize: 15 }} /> : <StarBorderIcon style={{ fontSize: 15 }} />}
            </button>
            <RouterLink
              className="atlas-actionBtnLink"
              to={row.path}
              aria-label={`Abrir ${row.name}`}
              title="Abrir"
            >
              <OpenIcon style={{ fontSize: 15 }} />
            </RouterLink>
          </span>
        );
      },
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <section className="atlas-tableContainerCard">
        <div className="atlas-filtersBar">
          <div className="atlas-searchFieldWrap" style={{ flex: 1 }}>
            <input
              className="atlas-filterInput"
              placeholder="Buscar por nome, descrição ou tag"
              aria-label="Buscar"
              value={query}
              onChange={e => setParam('q', e.target.value, '')}
            />
          </div>
          <Pill active={onlyStarred} onClick={() => setParam('fav', onlyStarred ? '' : '1', '')}>
            ★ Favoritos
          </Pill>
          {hasFilters && (
            <button
              type="button"
              className="atlas-actionBtnLink"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="atlas-filtersBar atlas-filtersBarWrap">
          {kinds.length > 1 && (
            <label className="atlas-labeledSelect">
              <span className="atlas-labeledSelectLabel">Tipo</span>
              <select
                className="atlas-filterSelect"
                value={kind}
                onChange={e => setParam('kind', e.target.value, 'Todos')}
              >
                <option value="Todos">Todos</option>
                {kinds.map(k => (
                  <option key={k} value={k}>{KIND_LABEL[k] ?? k}</option>
                ))}
              </select>
            </label>
          )}
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Dono</span>
            <select
              className="atlas-filterSelect"
              value={owner}
              onChange={e => setParam('owner', e.target.value, 'Todos')}
            >
              {['Todos', ...owners].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="atlas-labeledSelect">
            <span className="atlas-labeledSelectLabel">Tag</span>
            <select
              className="atlas-filterSelect"
              value={tag}
              onChange={e => setParam('tag', e.target.value, 'Todas')}
            >
              {['Todas', ...tags].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <DataTable
          columns={columns}
          rows={pageRows}
          loading={loading}
          emptyMessage={hasFilters ? 'Nada encontrado com esses filtros.' : emptyMessage}
        />

        {!loading && rows.length > 0 && (
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            info={`${rows.length} ${rows.length === 1 ? 'item' : 'itens'}`}
          />
        )}
      </section>
    </AtlasPage>
  );
}
