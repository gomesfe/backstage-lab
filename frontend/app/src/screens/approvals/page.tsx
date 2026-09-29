import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import ApprovalIcon from '@material-ui/icons/AssignmentTurnedIn';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const approvalsRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'approvals',
  params: {
    path: '/approvals',
    routeRef: approvalsRouteRef,
    title: 'Aprovações',
    icon: <ApprovalIcon />,
    noHeader: true,
    loader: async () => {
      const { ApprovalsPage } = await import('./ApprovalsPage');
      return <ApprovalsPage />;
    },
  },
});
