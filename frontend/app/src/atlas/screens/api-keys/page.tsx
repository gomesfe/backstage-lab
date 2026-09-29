import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import KeyIcon from '@material-ui/icons/VpnKey';

/**
 * Registro de API Keys. Entra no plugin `admin` em `screens/index.ts`.
 */
export const apiKeysRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'api-keys',
  params: {
    path: '/api-keys',
    routeRef: apiKeysRouteRef,
    title: 'API Keys',
    icon: <KeyIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="api-keys" />;
    },
  },
});
