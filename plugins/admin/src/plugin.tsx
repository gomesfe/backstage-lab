import {
  ApiBlueprint,
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import SettingsIcon from '@material-ui/icons/SupervisorAccount';
import KeyIcon from '@material-ui/icons/VpnKey';
import { ApiKeysClient, apiKeysApiRef } from './api/ApiKeysClient';

export const adminRouteRef = createRouteRef();
export const apiKeysRouteRef = createRouteRef();

const apiKeysApi = ApiBlueprint.make({
  name: 'api-keys',
  params: define =>
    define({
      api: apiKeysApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: deps => new ApiKeysClient(deps),
    }),
});

/**
 * Duas telas, como no redesign: as chaves são tarefa de quem desenvolve, o
 * painel é de quem administra. Juntá-las numa só esconderia a diferença de
 * permissão entre ver as próprias chaves e ver as de todo mundo.
 */
const apiKeysPage = PageBlueprint.make({
  name: 'api-keys',
  params: {
    path: '/api-keys',
    routeRef: apiKeysRouteRef,
    title: 'API Keys',
    icon: <KeyIcon />,
    noHeader: true,
    loader: async () => {
      const { ApiKeysPage } = await import('./components/ApiKeysPage');
      return <ApiKeysPage />;
    },
  },
});

const adminPage = PageBlueprint.make({
  params: {
    path: '/admin',
    routeRef: adminRouteRef,
    title: 'Administração',
    icon: <SettingsIcon />,
    noHeader: true,
    loader: async () => {
      const { AdminPage } = await import('./components/AdminPage');
      return <AdminPage />;
    },
  },
});

export const adminPlugin = createFrontendPlugin({
  pluginId: 'admin',
  routes: { root: adminRouteRef, apiKeys: apiKeysRouteRef },
  extensions: [apiKeysApi, apiKeysPage, adminPage],
});

export default adminPlugin;
