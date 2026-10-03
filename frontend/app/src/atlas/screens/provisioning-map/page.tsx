import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import MapIcon from '@material-ui/icons/Map';

/**
 * Registro da tela no portal: rota, título e ícone. Entra no plugin
 * `atlas-pages` em `screens/index.ts`.
 */
export const provisioningMapRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'provisioning-map',
  params: {
    path: '/provisioning-map',
    routeRef: provisioningMapRouteRef,
    title: 'Mapa de provisionamento',
    icon: <MapIcon />,
    noHeader: true,
    loader: async () => {
      // Tela em React, em components/provisioningMap.
      const { ProvisioningMapPage } = await import(
        '../../../components/provisioningMap'
      );
      return <ProvisioningMapPage />;
    },
  },
});
