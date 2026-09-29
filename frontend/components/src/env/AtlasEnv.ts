import { createApiRef } from '@backstage/core-plugin-api';
import type { Config } from '@backstage/config';

export type EnvName = 'local' | 'dev' | 'lab' | 'prod';

const ENV_NAMES: readonly EnvName[] = ['local', 'dev', 'lab', 'prod'];

/**
 * De que ambiente esta instalação do portal é.
 *
 * O Atlas mostra rotas diferentes por ambiente — devtools só em dev,
 * release notes só em lab. Sem um lugar único que responda "onde estou", essa
 * decisão se espalha em `if (location.host.includes(...))` pela app inteira,
 * e ninguém mais consegue responder o que aparece em produção.
 */
export interface AtlasEnvApi {
  readonly envName: EnvName;
  readonly version: string;

  readonly isLocal: boolean;
  readonly isDev: boolean;
  readonly isLab: boolean;
  readonly isProd: boolean;

  /**
   * Se é aceitável expor ferramenta de diagnóstico aqui: devtools,
   * visualizador de extensões, release notes.
   *
   * Definido como "não é produção", e não como uma lista de ambientes, para
   * que um ambiente novo nasça fechado e alguém precise abri-lo de propósito.
   */
  readonly showsDiagnostics: boolean;
}

export const atlasEnvApiRef = createApiRef<AtlasEnvApi>({
  id: 'plugin.components.atlas-env',
});

export class AtlasEnvError extends Error {}

/**
 * Lê o ambiente do app-config (`atlas.env` e `atlas.version`).
 *
 * Vem de config e não de variável de build de propósito: o mesmo bundle serve
 * todos os ambientes, e trocar de ambiente não exige rebuild. O custo é que o
 * valor só existe em runtime — não dá para usar em `if` de tree-shaking.
 */
export function createAtlasEnv(config: Config): AtlasEnvApi {
  const raw = config.getOptionalString('atlas.env') ?? 'local';

  if (!(ENV_NAMES as readonly string[]).includes(raw)) {
    // Errar o nome é fácil e silencioso: `prd` em vez de `prod` desligaria as
    // proteções de produção sem nenhum aviso. Melhor não subir.
    throw new AtlasEnvError(
      `atlas.env="${raw}" não é um ambiente conhecido. Use um de: ${ENV_NAMES.join(', ')}.`,
    );
  }

  const envName = raw as EnvName;

  return {
    envName,
    version: config.getOptionalString('atlas.version') ?? '0.0.0-dev',
    isLocal: envName === 'local',
    isDev: envName === 'dev',
    isLab: envName === 'lab',
    isProd: envName === 'prod',
    showsDiagnostics: envName !== 'prod',
  };
}
