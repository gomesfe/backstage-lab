import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useDebounce from 'react-use/lib/useDebounce';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import ArrowIcon from '@material-ui/icons/CallMade';
import { useApi } from '@backstage/core-plugin-api';
import { searchApiRef } from '@backstage/plugin-search-react';
import { ResponseErrorPanel } from '@backstage/core-components';
import { AtlasPage, Badge, Tabs, type BadgeVariant } from '@internal/plugin-components';

const TYPE_VARIANT: Record<string, BadgeVariant> = {
  'software-catalog': 'lime',
  techdocs: 'info',
};

const TYPE_LABEL: Record<string, string> = {
  'software-catalog': 'catálogo',
  techdocs: 'docs',
};

const FILTERS = [
  { id: '', label: 'Tudo' },
  { id: 'software-catalog', label: 'Catálogo' },
  { id: 'techdocs', label: 'Docs' },
];

/**
 * Busca global. O que a tela deve conter está em `README.md`.
 *
 * Usa o índice de busca do Backstage, que já indexa catálogo e TechDocs. O
 * design mostra resultados mock; trocar por busca real é o que faz a tela
 * valer — uma busca que não encontra o que existe é pior que nenhuma.
 */
export function AtlasSearchPage() {
  const searchApi = useApi(searchApiRef);
  const [params, setParams] = useSearchParams();

  // O termo e o filtro ficam na URL: o link da busca pode ser compartilhado
  // e o "voltar" do navegador volta para os resultados.
  const [term, setTerm] = useState(params.get('q') ?? '');
  const [debounced, setDebounced] = useState(term);
  const type = params.get('type') ?? '';

  useDebounce(() => setDebounced(term), 300, [term]);
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced.trim()) next.set('q', debounced.trim());
    else next.delete('q');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  const setType = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('type', value);
    else next.delete('type');
    setParams(next, { replace: true });
  };

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
            aria-label="Buscar no Atlas"
            placeholder="Buscar serviços, APIs e documentação"
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
            <span className="atlas-paginationInfo">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{debounced}”
            </span>
            {results.map((result, index) => (
              <RouterLink
                key={`${result.document.location}-${index}`}
                className="atlas-usefulLinkItem"
                style={{ alignItems: 'flex-start' }}
                to={result.document.location}
              >
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {result.document.title}
                    <Badge variant={TYPE_VARIANT[result.type] ?? 'purple'}>
                      {TYPE_LABEL[result.type] ?? result.type}
                    </Badge>
                  </span>
                  <span className="atlas-homeUpdateMeta atlas-clamp2" style={{ fontWeight: 400 }}>
                    {result.document.text}
                  </span>
                </span>
                <ArrowIcon style={{ fontSize: 16 }} />
              </RouterLink>
            ))}
          </div>
        )}
      </section>
    </AtlasPage>
  );
}
