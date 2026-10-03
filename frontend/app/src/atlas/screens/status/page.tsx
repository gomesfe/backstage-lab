import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import StatusIcon from '@material-ui/icons/NetworkCheck';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const statusRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'status',
  params: {
    path: '/status',
    routeRef: statusRouteRef,
    title: 'Status',
    icon: <StatusIcon />,
    noHeader: true,
    loader: async () => {
      // Tela em React, em components/status.
      const { StatusPage } = await import('../../../components/status');
      return <StatusPage />;
    },
  },
});
