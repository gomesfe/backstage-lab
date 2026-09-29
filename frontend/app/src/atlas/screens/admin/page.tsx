import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import SettingsIcon from '@material-ui/icons/SupervisorAccount';

/**
 * Registro da Administração. Entra no plugin `admin` em `screens/index.ts`.
 *
 * Duas telas, como no redesign: as chaves são tarefa de quem desenvolve, o
 * painel é de quem administra. Juntá-las numa só esconderia a diferença de
 * permissão entre ver as próprias chaves e ver as de todo mundo.
 */
export const adminRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  params: {
    path: '/admin',
    routeRef: adminRouteRef,
    title: 'Administração',
    icon: <SettingsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="admin" />;
    },
  },
});
