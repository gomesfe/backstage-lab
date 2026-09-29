import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { AtlasTopNav } from './AtlasTopNav';

/**
 * Navegação do Atlas: pílulas no topo, não sidebar.
 *
 * O `SidebarPage` do Backstage continua sendo o shell — ele fornece contextos
 * que vários componentes consomem (estado de pin, ref de conteúdo). Só o
 * conteúdo da nav é substituído, e o tema zera o padding lateral que o
 * SidebarPage reserva para a barra que não existe mais.
 */
const navContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => <AtlasTopNav navItems={navItems} />,
  },
});

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [navContent],
});
