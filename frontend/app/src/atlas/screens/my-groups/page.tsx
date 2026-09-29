import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import GroupsIcon from '@material-ui/icons/Group';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const myGroupsRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'my-groups',
  params: {
    path: '/my-groups',
    routeRef: myGroupsRouteRef,
    title: 'Meus grupos',
    icon: <GroupsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="my-groups" />;
    },
  },
});
