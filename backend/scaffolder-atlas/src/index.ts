import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createAtlasModeAction } from './actions/modeAction';
import { createAtlasPublishLocalAction } from './actions/publishLocalAction';

export { readProvisioningMode } from './actions/provisioningMode';
export type { ProvisioningMode } from './actions/provisioningMode';

export const scaffolderModuleAtlas = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'atlas-actions',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(
          createAtlasModeAction({ config }),
          createAtlasPublishLocalAction({ config }),
        );
      },
    });
  },
});

export default scaffolderModuleAtlas;
