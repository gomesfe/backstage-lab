import { resolve as resolvePath } from 'node:path';
import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { ConversationStore } from './database/ConversationStore';
import { AtlasAgent } from './agent/AtlasAgent';
import { createRouter } from './service/router';

/** Em dev o código roda de `src/`, no build de `dist/` — subir um nível serve aos dois. */
const MIGRATIONS_DIR = resolvePath(__dirname, '../migrations');

const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;

/**
 * Agente do Atlas: chat com histórico por usuário, respondido pelo Claude.
 *
 * Config (todas opcionais):
 *   atlas.agent.model          modelo (padrão claude-opus-5)
 *   atlas.agent.effort         low | medium | high | xhigh | max (padrão medium)
 *   atlas.agent.maxToolRounds  rodadas de consulta por resposta (padrão 6)
 *
 * A credencial vem do ambiente do backend (ANTHROPIC_API_KEY), nunca do
 * app-config: assim ela não aparece em arquivo versionado.
 */
export const atlasAgentPlugin = createBackendPlugin({
  pluginId: 'atlas-agent',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
      },
      async init({ logger, config, database, httpAuth, httpRouter, catalog }) {
        const db = await database.getClient();
        if (!database.migrations?.skip) {
          await db.migrate.latest({ directory: MIGRATIONS_DIR });
          logger.info('Migrações do agente aplicadas');
        }

        const effort = config.getOptionalString('atlas.agent.effort') ?? 'medium';
        if (!EFFORTS.includes(effort as (typeof EFFORTS)[number])) {
          throw new Error(`atlas.agent.effort inválido: ${effort}. Use ${EFFORTS.join(', ')}.`);
        }

        const agent = new AtlasAgent({
          model: config.getOptionalString('atlas.agent.model') ?? 'claude-opus-5',
          effort: effort as (typeof EFFORTS)[number],
          maxToolRounds: config.getOptionalNumber('atlas.agent.maxToolRounds') ?? 6,
          logger,
        });

        httpRouter.use(
          await createRouter({ store: new ConversationStore(db), agent, catalog, httpAuth, logger }),
        );
      },
    });
  },
});
