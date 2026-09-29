import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import ShieldIcon from '@material-ui/icons/LockOpen';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const breakGlassRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'break-glass',
  params: {
    path: '/break-glass',
    routeRef: breakGlassRouteRef,
    title: 'Break Glass',
    icon: <ShieldIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="break-glass" />;
    },
  },
});
