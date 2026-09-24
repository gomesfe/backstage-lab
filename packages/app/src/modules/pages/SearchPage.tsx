import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useDebounce from 'react-use/lib/useDebounce';
import { useNavigate } from 'react-router-dom';
import ArrowIcon from '@material-ui/icons/CallMade';
import { useApi } from '@backstage/core-plugin-api';
import { searchApiRef } from '@backstage/plugin-search-react';
import { ResponseErrorPanel } from '@backstage/core-components';
import { AtlasPage, Badge, Tabs, type BadgeVariant } from '@internal/plugin-components';

const TYPE_VARIANT: Record<string, BadgeVariant> = {
  'software-catalog': 'lime',
  techdocs: 'info',
};

const FILTERS = [
  { id: '', label: 'Tudo' },
  { id: 'software-catalog', label: 'Catálogo' },
  { id: 'techdocs', label: 'Docs' },
];

/**
 * Busca global, portada de `SearchPage.tsx` do redesign.
 *
 * Usa o índice de busca do Backstage, que já indexa catálogo e TechDocs. O
 * design mostra resultados mock; trocar por busca real é o que faz a tela
 * valer — uma busca que não encontra o que existe é pior que nenhuma.
 */
export function AtlasSearchPage() {
  const searchApi = useApi(searchApiRef);
  const navigate = useNavigate();

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [type, setType] = useState('');

  useDebounce(() => setDebounced(term), 300, [term]);

  const { value, loading, error } = useAsync(async () => {
    if (!debounced.trim()) return { results: [] };
    return searchApi.query({
      term: debounced,
      types: type ? [type] : undefined,
    });
  }, [searchApi, debounced, type]);

  const results = useMemo(() => value?.results ?? [], [value]);

  return (
    <AtlasPage
      eyebrow="Busca global"
      title="Buscar"
      subtitle="Encontre serviços, APIs e documentação em todo o portal."
    >
      <section className="atlas-tableContainerCard">
        <div className="atlas-searchFieldWrap" style={{ width: '100%' }}>
          <input
            className="atlas-filterInput"
            style={{ width: '100%' }}
            autoFocus
            placeholder="Buscar no Atlas…"
            value={term}
            onChange={e => setTerm(e.target.value)}
          />
        </div>

        <Tabs
          tabs={FILTERS.map(f => ({ id: f.id || 'all', label: f.label }))}
          active={type || 'all'}
          onChange={id => setType(id === 'all' ? '' : id)}
        />

        {error && <ResponseErrorPanel error={error} />}

        {!error && loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="atlas-skeletonLine" style={{ width: `${85 - index * 10}%` }} />
            ))}
          </div>
        )}

        {!error && !loading && !debounced.trim() && (
          <div className="atlas-emptyState">
            Digite para buscar no catálogo e na documentação.
          </div>
        )}

        {!error && !loading && debounced.trim() && results.length === 0 && (
          <div className="atlas-emptyState">
            Nenhum resultado para “{debounced}”.
          </div>
        )}

        {!error && !loading && results.length > 0 && (
          <div className="atlas-usefulLinksList">
            <span className="atlas-paginationInfo">{results.length} resultado(s)</span>
            {results.map((result, index) => (
              <a
                key={`${result.document.location}-${index}`}
                className="atlas-usefulLinkItem"
                style={{ alignItems: 'flex-start' }}
                onClick={() => navigate(result.document.location)}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {result.document.title}
                    <Badge variant={TYPE_VARIANT[result.type] ?? 'purple'}>
                      {result.type}
                    </Badge>
                  </span>
                  <span className="atlas-homeUpdateMeta" style={{ fontWeight: 400 }}>
                    {result.document.text}
                  </span>
                </span>
                <ArrowIcon style={{ fontSize: 16 }} />
              </a>
            ))}
          </div>
        )}
      </section>
    </AtlasPage>
  );
}
