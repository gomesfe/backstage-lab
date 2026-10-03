import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import CatalogIcon from '@material-ui/icons/ViewModule';
import catalogPlugin from '@backstage/plugin-catalog/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `catalog` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/catalog',
    routeRef: catalogPlugin.routes.catalogIndex,
    title: 'Catálogo',
    icon: <CatalogIcon />,
    noHeader: true,
    loader: async () => {
      // Tela em React, em components/catalog.
      const { CatalogPage } = await import('../../../components/catalog');
      return <CatalogPage />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [page],
});
