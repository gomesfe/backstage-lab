import {
  ApiBlueprint,
  configApiRef,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { atlasEnvApiRef, createAtlasEnv } from '@internal/plugin-components';

/**
 * Registra a API de ambiente. Fica no app e não num plugin porque todo plugin
 * pode precisar dela — inclusive para decidir se sequer aparece.
 */
const atlasEnvApi = ApiBlueprint.make({
  name: 'atlas-env',
  params: define =>
    define({
      api: atlasEnvApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => createAtlasEnv(configApi),
    }),
});

export const envModule = createFrontendModule({
  pluginId: 'app',
  extensions: [atlasEnvApi],
});
