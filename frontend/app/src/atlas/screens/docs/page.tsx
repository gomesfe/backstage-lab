import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import DocsIcon from '@material-ui/icons/MenuBook';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `techdocs` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/docs',
    routeRef: techdocsPlugin.routes.root,
    title: 'Docs',
    icon: <DocsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="docs" />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [page],
});
