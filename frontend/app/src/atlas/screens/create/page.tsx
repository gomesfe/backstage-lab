import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import CreateIcon from '@material-ui/icons/AddCircleOutline';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `scaffolder` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/create',
    routeRef: scaffolderPlugin.routes.root,
    title: 'Ofertas',
    icon: <CreateIcon />,
    noHeader: true,
    loader: async () => {
      // Galeria em React, em components/offers; as sub-rotas seguem com o
      // scaffolder.
      const { CreatePage } = await import('../../../components/offers');
      return <CreatePage />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [page],
});
