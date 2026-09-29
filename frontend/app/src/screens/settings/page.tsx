import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import SettingsIcon from '@material-ui/icons/Settings';

/**
 * Registro da tela no portal. Substitui a página de índice do plugin
 * `user-settings` (mesmo `pluginId`, extensão sem nome → mesmo id de página) e
 * reaproveita o `routeRef` dele, para links existentes continuarem resolvendo.
 */
export const page = PageBlueprint.make({
  params: {
    path: '/settings',
    title: 'Configurações',
    icon: <SettingsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasSettingsPage } = await import('./SettingsPage');
      return <AtlasSettingsPage />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'user-settings',
  extensions: [page],
});
