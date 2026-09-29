import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import ApiIcon from '@material-ui/icons/Extension';
import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `api-docs` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/api-docs',
    routeRef: apiDocsPlugin.routes.root,
    title: 'APIs',
    icon: <ApiIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="apis" />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'api-docs',
  extensions: [page],
});
