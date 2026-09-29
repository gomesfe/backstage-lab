import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import SearchIcon from '@material-ui/icons/Search';
import searchPlugin from '@backstage/plugin-search/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `search` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/search',
    routeRef: searchPlugin.routes.root,
    title: 'Buscar',
    icon: <SearchIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="search" />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'search',
  extensions: [page],
});
