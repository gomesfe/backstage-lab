import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { ResponseErrorPanel } from '@backstage/core-components';
import {
  AtlasPage,
  Badge,
  CardGrid,
  FeatureCard,
  Pill,
} from '@internal/plugin-components';

const CATEGORY_ANNOTATION = 'atlas.nuclea.com.br/categoria';
const UNCATEGORIZED = 'Outros';

/**
 * Galeria de templates, portada de `CreatePage.tsx` do redesign, agrupada
 * por categoria.
 *
 * Os templates de recurso AWS já carregam a anotação de categoria; os demais
 * caem em "Outros". Agrupar importa a partir de uma dúzia de templates — uma
 * lista chapada de 18 cartões não ajuda ninguém a achar o que quer.
 */
function TemplateGallery() {
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
        <button
          type="button"
          className="atlas-btnPill"
          onClick={() => navigate('/create/tasks')}
        >
          Ver tarefas
        </button>
      }
    >
      <div className="atlas-filtersBar">
        <div className="atlas-searchFieldWrap" style={{ flex: 1, minWidth: 200 }}>
          <input
            className="atlas-filterInput"
            style={{ width: '100%' }}
            placeholder="Buscar template"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
        {['Todas', ...categories].map(c => (
          <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Pill>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className="atlas-skeletonLine" style={{ width: `${85 - index * 10}%` }} />
          ))}
        </div>
      )}

      {!loading && grouped.length === 0 && (
        <FeatureCard
          title="Nenhum template"
          body="Ajuste o filtro, ou rode `yarn templates:sync` se acabou de adicionar um spec."
        />
      )}

      {grouped.map(([groupName, groupTemplates]) => (
        <div key={groupName} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="atlas-groupHeading">
            {groupName}
            <span className="atlas-groupHeadingCount">{groupTemplates.length}</span>
          </h2>
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
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(template.metadata.tags ?? []).slice(0, 3).map(t => (
                          <span key={t} className="atlas-tagChip">{t}</span>
                        ))}
                      </span>
                      <button
                        type="button"
                        className="atlas-btnPill atlas-btnPillLime"
                        style={{ marginLeft: 'auto' }}
                        onClick={() =>
                          navigate(`/create/templates/${namespace}/${name}`)
                        }
                      >
                        Choose
                      </button>
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
