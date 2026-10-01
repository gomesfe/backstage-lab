import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import SkillsIcon from '@material-ui/icons/Extension';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const skillsRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'skills',
  params: {
    path: '/skills',
    routeRef: skillsRouteRef,
    title: 'Skills',
    icon: <SkillsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="skills" />;
    },
  },
});
