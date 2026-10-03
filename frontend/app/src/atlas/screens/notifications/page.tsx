import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `notifications` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/notifications',
    routeRef: notificationsPlugin.routes.root,
    title: 'Notificações',
    icon: <NotificationsIcon />,
    noHeader: true,
    loader: async () => {
      // Tela em React, em components/notifications.
      const { NotificationsPage } = await import(
        '../../../components/notifications'
      );
      return <NotificationsPage />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'notifications',
  extensions: [page],
});
