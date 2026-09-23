import {
  ApiBlueprint,
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import SettingsIcon from '@material-ui/icons/SettingsApplications';
import { ApiKeysClient, apiKeysApiRef } from './api/ApiKeysClient';

export const adminRouteRef = createRouteRef();

const apiKeysApi = ApiBlueprint.make({
  name: 'api-keys',
  params: define =>
    define({
      api: apiKeysApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: deps => new ApiKeysClient(deps),
    }),
});

const adminPage = PageBlueprint.make({
  name: 'api-keys',
  params: {
    path: '/admin',
    routeRef: adminRouteRef,
    title: 'Administração',
    icon: <SettingsIcon />,
    noHeader: true,
    loader: async () => {
      const { ApiKeysPage } = await import('./components/ApiKeysPage');
      return <ApiKeysPage />;
    },
  },
});

export const adminPlugin = createFrontendPlugin({
  pluginId: 'admin',
  routes: { root: adminRouteRef },
  extensions: [apiKeysApi, adminPage],
});

export default adminPlugin;
