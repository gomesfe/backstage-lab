import { resolve as resolvePath } from 'node:path';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { ApiKeyStore } from './database/ApiKeyStore';
import { createRouter } from './service/router';

/**
 * As migrações moram em `migrations/` na raiz do pacote. Em dev o código roda
 * de `src/`, no build roda de `dist/` — subir um nível resolve os dois casos.
 */
const MIGRATIONS_DIR = resolvePath(__dirname, '../migrations');

export const apiKeysPlugin = createBackendPlugin({
  pluginId: 'api-keys',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        permissions: coreServices.permissions,
      },
      async init({ logger, database, httpAuth, httpRouter, permissions }) {
        const db = await database.getClient();

        if (!database.migrations?.skip) {
          await db.migrate.latest({ directory: MIGRATIONS_DIR });
          logger.info('Migrações de api-keys aplicadas');
        }

        httpRouter.use(
          await createRouter({
            store: new ApiKeyStore(db),
            httpAuth,
            permissions,
            logger,
          }),
        );
      },
    });
  },
});
