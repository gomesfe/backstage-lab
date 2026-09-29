import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import AgentIcon from '@material-ui/icons/Forum';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const agentRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'agent',
  params: {
    path: '/agent',
    routeRef: agentRouteRef,
    title: 'Agente',
    icon: <AgentIcon />,
    noHeader: true,
    loader: async () => {
      const { AgentPage } = await import('./AgentPage');
      return <AgentPage />;
    },
  },
});
