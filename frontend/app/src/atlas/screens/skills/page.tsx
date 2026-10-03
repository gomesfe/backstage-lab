import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import SkillsIcon from '@material-ui/icons/EmojiObjectsOutlined';

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
      // Tela em React (components/skills), no padrão do repositório do
      // Atlas. O index.html desta pasta fica como referência visual avulsa.
      const { SkillsPage } = await import('../../../components/skills');
      return <SkillsPage />;
    },
  },
});
