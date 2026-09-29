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
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="atlas-jira" />;
    },
  },
});
