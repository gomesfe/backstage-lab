import { readFile, watch } from 'node:fs/promises';
import { findPaths } from '@backstage/cli-common';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { AtlasPermissionPolicy } from './AtlasPermissionPolicy';
import { parsePolicy, type RbacPolicy } from './policyFile';

export { parsePolicy, rolesFor } from './policyFile';
export type { RbacPolicy, PolicyRule, RoleBinding } from './policyFile';
export { AtlasPermissionPolicy } from './AtlasPermissionPolicy';

const DEFAULT_PATH = 'rbac-policy.csv';

/**
 * Liga a política de permissões do Atlas.
 *
 * Config:
 *   permission:
 *     rbac:
 *       policyFile: rbac-policy.csv   # relativo à raiz do repo
 *       watch: true                   # recarrega ao salvar o arquivo
 */
export const rbacModule = createBackendModule({
  pluginId: 'permission',
  moduleId: 'atlas-rbac',
  register(reg) {
    reg.registerInit({
      deps: {
        policy: policyExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ policy, config, logger }) {
        // O backend roda com cwd em packages/backend, mas o CSV mora na raiz
        // do repo — resolver por cwd apontaria para o lugar errado.
        const file = findPaths(process.cwd()).resolveTargetRoot(
          config.getOptionalString('permission.rbac.policyFile') ??
            DEFAULT_PATH,
        );
        const shouldWatch =
          config.getOptionalBoolean('permission.rbac.watch') ?? false;

        let current: RbacPolicy = parsePolicy(await readFile(file, 'utf8'));
        logger.info(
          `RBAC carregado de ${file}: ${current.rules.length} regra(s), ` +
            `${current.bindings.length} vínculo(s)`,
        );

        if (shouldWatch) {
          // Um CSV inválido não pode derrubar as permissões do portal inteiro:
          // se o parse falhar, seguimos com a última versão boa e logamos.
          void (async () => {
            try {
              for await (const _event of watch(file)) {
                try {
                  current = parsePolicy(await readFile(file, 'utf8'));
                  logger.info(
                    `RBAC recarregado: ${current.rules.length} regra(s), ` +
                      `${current.bindings.length} vínculo(s)`,
                  );
                } catch (error) {
                  logger.error(
                    `RBAC não recarregado, mantendo a versão anterior: ${error}`,
                  );
                }
              }
            } catch (error) {
              logger.warn(`Parei de observar ${file}: ${error}`);
            }
          })();
        }

        policy.setPolicy(new AtlasPermissionPolicy(() => current));
      },
    });
  },
});

export default rbacModule;
