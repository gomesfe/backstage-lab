import { useMemo, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';
import useDebounce from 'react-use/lib/useDebounce';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TextField from '@material-ui/core/TextField';
import ArrowIcon from '@material-ui/icons/CallMade';
import { useApi } from '@backstage/core-plugin-api';
import { searchApiRef } from '@backstage/plugin-search-react';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import {
  AtlasPage,
  Badge,
  atlasTokens,
  type BadgeVariant,
} from '@internal/plugin-components';

const { radius } = atlasTokens;

const TYPE_VARIANT: Record<string, BadgeVariant> = {
  'software-catalog': 'lime',
  techdocs: 'info',
};

const FILTERS = [
  { id: '', label: 'Tudo' },
  { id: 'software-catalog', label: 'Catálogo' },
  { id: 'techdocs', label: 'Docs' },
];

const useStyles = makeStyles(theme => ({
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  result: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 0',
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
    '&:last-child': { borderBottom: 0 },
    '&:hover $title': { color: atlasTokens.brand.lime },
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
  },
  snippet: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    marginTop: 4,
  },
  count: { fontSize: '0.78rem', color: theme.palette.text.disabled },
  empty: {
    padding: '24px 0',
    color: theme.palette.text.secondary,
    fontSize: '0.86rem',
  },
}));

/**
 * Busca global.
 *
 * Usa o índice de busca do Backstage, que já indexa catálogo e TechDocs.
 * O design mostra resultados mock; trocar por busca real é o que faz a tela
 * valer — uma busca que não encontra o que existe é pior que nenhuma.
 */
export function AtlasSearchPage() {
  const classes = useStyles();
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
      <div className={classes.card}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          autoFocus
          placeholder="Buscar no Atlas…"
          value={term}
          onChange={event => setTerm(event.target.value)}
        />

        <Tabs
          value={FILTERS.findIndex(f => f.id === type)}
          onChange={(_, index) => setType(FILTERS[index].id)}
          indicatorColor="primary"
          textColor="primary"
        >
          {FILTERS.map(filter => (
            <Tab key={filter.id || 'all'} label={filter.label} />
          ))}
        </Tabs>

        {error && <ResponseErrorPanel error={error} />}

        {!error && loading && <Progress />}

        {!error && !loading && !debounced.trim() && (
          <div className={classes.empty}>
            Digite para buscar no catálogo e na documentação.
          </div>
        )}

        {!error && !loading && debounced.trim() && results.length === 0 && (
          <div className={classes.empty}>
            Nenhum resultado para “{debounced}”.
          </div>
        )}

        {!error && !loading && results.length > 0 && (
          <>
            <span className={classes.count}>
              {results.length} resultado(s)
            </span>
            {results.map((result, index) => (
              <div
                key={`${result.document.location}-${index}`}
                className={classes.result}
                role="link"
                tabIndex={0}
                onClick={() => navigate(result.document.location)}
                onKeyDown={e =>
                  e.key === 'Enter' && navigate(result.document.location)
                }
              >
                <div>
                  <div className={classes.title}>
                    {result.document.title}
                    <Badge variant={TYPE_VARIANT[result.type] ?? 'purple'}>
                      {result.type}
                    </Badge>
                  </div>
                  <div className={classes.snippet}>{result.document.text}</div>
                </div>
                <ArrowIcon fontSize="small" />
              </div>
            ))}
          </>
        )}
      </div>
    </AtlasPage>
  );
}
