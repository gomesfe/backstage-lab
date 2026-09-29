import Tooltip from '@material-ui/core/Tooltip';
import { useApi } from '@backstage/core-plugin-api';
import { atlasEnvApiRef, type EnvName } from '../env/AtlasEnv';

/**
 * Selo do ambiente, na barra de navegação.
 *
 * Usa as etiquetas do design system. Produção não ganha cor de alerta: o
 * alerta seria ver o selo de lab quando você achava que estava em produção,
 * não o contrário.
 */
const VARIANT: Record<EnvName, string> = {
  local: 'atlas-badgeInfo',
  dev: 'atlas-badgeInfo',
  lab: 'atlas-badgeWarning',
  prod: 'atlas-badgeLime',
};

const DESCRIPTION: Record<EnvName, string> = {
  local: 'Rodando na sua máquina',
  dev: 'Ambiente de desenvolvimento',
  lab: 'Ambiente de laboratório',
  prod: 'Produção — o que você fizer aqui é real',
};

export function EnvBadge() {
  const env = useApi(atlasEnvApiRef);

  return (
    <Tooltip title={`${DESCRIPTION[env.envName]} · v${env.version}`}>
      <span className={`atlas-badgeTag ${VARIANT[env.envName]}`}>
        {env.envName}
      </span>
    </Tooltip>
  );
}
