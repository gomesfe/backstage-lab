import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
  atlasTokens,
} from '@internal/plugin-components';

const { radius } = atlasTokens;

const CATEGORY_ANNOTATION = 'atlas.nuclea.com.br/categoria';
const UNCATEGORIZED = 'Outros';

const useStyles = makeStyles(theme => ({
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '10px 14px',
  },
  search: { minWidth: 240, flex: 1 },
  pill: {
    border: `1px solid ${theme.palette.divider}`,
    background: 'transparent',
    color: theme.palette.text.secondary,
    borderRadius: radius.pill,
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
  groupTitle: {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: theme.palette.text.primary,
    margin: '4px 0 0',
  },
  group: { display: 'flex', flexDirection: 'column', gap: 12 },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
}));

/**
 * Galeria de templates, agrupada por categoria.
 *
 * Os templates de recurso AWS já carregam a anotação de categoria; os demais
 * caem em "Outros". Agrupar importa a partir de uma dúzia de templates — uma
 * lista chapada de 18 cartões não ajuda ninguém a achar o que quer.
 */
function TemplateGallery() {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');

  const { value, loading, error } = useAsync(async () => {
    const { items } = await catalogApi.getEntities({
      filter: { kind: 'Template' },
    });
    return items;
  }, [catalogApi]);

  const templates = value ?? [];

  const categories = useMemo(
    () =>
      [
        ...new Set(
          templates.map(
            t => t.metadata.annotations?.[CATEGORY_ANNOTATION] ?? UNCATEGORIZED,
          ),
        ),
      ].sort(),
    [templates],
  );

  const grouped = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = templates.filter(template => {
      const templateCategory =
        template.metadata.annotations?.[CATEGORY_ANNOTATION] ?? UNCATEGORIZED;
      if (category !== 'Todas' && templateCategory !== category) return false;
      if (!term) return true;
      return `${template.metadata.title ?? template.metadata.name} ${
        template.metadata.description ?? ''
      } ${(template.metadata.tags ?? []).join(' ')}`
        .toLowerCase()
        .includes(term);
    });

    const groups = new Map<string, typeof filtered>();
    for (const template of filtered) {
      const key =
        template.metadata.annotations?.[CATEGORY_ANNOTATION] ?? UNCATEGORIZED;
      groups.set(key, [...(groups.get(key) ?? []), template]);
    }

    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [templates, query, category]);

  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <AtlasPage
      eyebrow="Provisionamento"
      title="Create"
      subtitle="Escolha um template para provisionar recursos, criar repositórios ou registrar entidades."
      actions={
        <Button variant="outlined" onClick={() => navigate('/create/tasks')}>
          Ver tarefas
        </Button>
      }
    >
      <div className={classes.filters}>
        <TextField
          className={classes.search}
          size="small"
          variant="outlined"
          placeholder="Buscar template"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        {['Todas', ...categories].map(c => (
          <button
            key={c}
            type="button"
            className={`${classes.pill} ${
              category === c ? classes.pillActive : ''
            }`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <Progress />}

      {!loading && grouped.length === 0 && (
        <FeatureCard
          title="Nenhum template"
          body="Ajuste o filtro, ou rode `yarn templates:sync` se acabou de adicionar um spec."
        />
      )}

      {grouped.map(([groupName, groupTemplates]) => (
        <div key={groupName} className={classes.group}>
          <h2 className={classes.groupTitle}>{groupName}</h2>
          <CardGrid>
            {groupTemplates.map(template => {
              const name = template.metadata.name;
              const namespace = template.metadata.namespace ?? 'default';
              const spec = template.spec as { type?: string };

              return (
                <FeatureCard
                  key={name}
                  title={template.metadata.title ?? name}
                  badge={<Badge variant="info">{spec?.type ?? 'template'}</Badge>}
                  body={template.metadata.description}
                  footer={
                    <>
                      <span className={classes.tags}>
                        {(template.metadata.tags ?? []).slice(0, 3).join(' · ')}
                      </span>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: 'auto' }}
                        onClick={() =>
                          navigate(
                            `/create/templates/${namespace}/${name}`,
                          )
                        }
                      >
                        Choose
                      </Button>
                    </>
                  }
                />
              );
            })}
          </CardGrid>
        </div>
      ))}
    </AtlasPage>
  );
}

/**
 * A rota /create do portal.
 *
 * Só o índice é redesenhado. Tudo abaixo dele — o wizard do template, a
 * página da tarefa, o editor — continua sendo o do scaffolder: reimplementar
 * um formulário dirigido por JSON Schema, com campos customizados e execução
 * de tarefa, seria refazer o plugin inteiro para ganhar aparência.
 */
export function AtlasCreatePage() {
  const { pathname } = useLocation();
  const isIndex = pathname === '/create' || pathname === '/create/';

  return isIndex ? <TemplateGallery /> : <ScaffolderPage />;
}
