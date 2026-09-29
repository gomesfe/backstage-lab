import {
  ApiBlueprint,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import KeyIcon from '@material-ui/icons/VpnKey';
import { ApiKeysClient, apiKeysApiRef } from './ApiKeysClient';

/**
 * Registro de API Keys: a página e o cliente HTTP do backend `api-keys`
 * (também usado pela Administração). Entram no plugin `admin` em
 * `screens/index.ts`.
 */
export const apiKeysRouteRef = createRouteRef();

export const apiKeysApi = ApiBlueprint.make({
  name: 'api-keys',
  params: define =>
    define({
      api: apiKeysApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: deps => new ApiKeysClient(deps),
    }),
});

export const page = PageBlueprint.make({
  name: 'api-keys',
  params: {
    path: '/api-keys',
    routeRef: apiKeysRouteRef,
    title: 'API Keys',
    icon: <KeyIcon />,
    noHeader: true,
    loader: async () => {
      const { ApiKeysPage } = await import('./ApiKeysPage');
      return <ApiKeysPage />;
    },
  },
});
