import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
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
  atlasTokens,
  type BadgeVariant,
  type Column,
} from '@internal/plugin-components';
import type { Entity } from '@backstage/catalog-model';

const { radius, status } = atlasTokens;

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
  select: { minWidth: 150 },
  count: {
    marginLeft: 'auto',
    fontSize: '0.78rem',
    color: theme.palette.text.disabled,
    fontWeight: 700,
  },
  chips: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  chip: {
    background: theme.palette.action.hover,
    borderRadius: radius.pill,
    padding: '2px 8px',
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
  },
  actions: {
    display: 'flex',
    gap: 4,
    justifyContent: 'flex-end',
  },
  iconBtn: {
    background: 'transparent',
    border: 0,
    cursor: 'pointer',
    color: theme.palette.text.secondary,
    padding: 4,
    '&:hover': { color: theme.palette.text.primary },
  },
  name: { fontWeight: 700 },
}));

/**
 * Lista de entidades do catálogo em tabela, com filtros.
 *
 * Catálogo, APIs e Docs são a mesma tela com um filtro de kind diferente —
 * no design também. Uma implementação só evita que os filtros e as colunas
 * divirjam entre elas com o tempo.
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
  const classes = useStyles();
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
      render: row => <span className={classes.name}>{row.name}</span>,
    },
    { key: 'description', header: 'Descrição', render: row => row.description },
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
        <span className={classes.chips}>
          {row.tags.map(t => (
            <span key={t} className={classes.chip}>
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
        <span className={classes.actions}>
          <button
            type="button"
            className={classes.iconBtn}
            title="Favoritar"
            style={{
              color: favorites[row.id] ? status.warning : undefined,
            }}
            onClick={() =>
              setFavorites(current => ({
                ...current,
                [row.id]: !current[row.id],
              }))
            }
          >
            {favorites[row.id] ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </button>
          <button
            type="button"
            className={classes.iconBtn}
            title="Abrir"
            onClick={() => navigate(row.path)}
          >
            <OpenIcon fontSize="small" />
          </button>
        </span>
      ),
    },
  ];

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className={classes.filters}>
        <TextField
          className={classes.search}
          size="small"
          variant="outlined"
          placeholder="Buscar por nome, descrição ou tag"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <TextField
          className={classes.select}
          select
          size="small"
          variant="outlined"
          label="Dono"
          value={owner}
          onChange={event => setOwner(event.target.value)}
        >
          {['Todos', ...owners].map(o => (
            <MenuItem key={o} value={o}>
              {o}
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
          {['Todas', ...tags].map(t => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <span className={classes.count}>{rows.length} item(ns)</span>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage={emptyMessage}
      />
    </AtlasPage>
  );
}
