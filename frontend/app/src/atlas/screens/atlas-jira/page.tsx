import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import JiraIcon from '@material-ui/icons/CallSplit';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const atlasJiraRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'atlas-jira',
  params: {
    path: '/atlas-jira',
    routeRef: atlasJiraRouteRef,
    title: 'Atlas × Jira',
    icon: <JiraIcon />,
    noHeader: true,
    loader: async () => {
      // Tela em React (components/atlasJira), no padrão do repositório do
      // Atlas. O index.html desta pasta fica como referência visual avulsa.
      const { AtlasJiraPage } = await import('../../../components/atlasJira');
      return <AtlasJiraPage />;
    },
  },
});
