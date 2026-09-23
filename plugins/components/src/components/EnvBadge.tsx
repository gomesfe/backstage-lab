import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import { useApi } from '@backstage/core-plugin-api';
import { atlasEnvApiRef, type EnvName } from '../env/AtlasEnv';

const useStyles = makeStyles(theme => ({
  chip: {
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.palette.common.white,
  },
  local: { backgroundColor: theme.palette.grey[600] },
  dev: { backgroundColor: theme.palette.info.dark },
  lab: { backgroundColor: theme.palette.warning.dark },
  // Produção não ganha cor de alerta: o alerta seria ver o selo de lab quando
  // você achava que estava em produção, não o contrário.
  prod: { backgroundColor: theme.palette.success.dark },
}));

const DESCRIPTION: Record<EnvName, string> = {
  local: 'Rodando na sua máquina',
  dev: 'Ambiente de desenvolvimento',
  lab: 'Ambiente de laboratório',
  prod: 'Produção — o que você fizer aqui é real',
};

/**
 * Selo do ambiente. Fica na sidebar para que ninguém confunda lab com
 * produção ao abrir duas abas.
 */
export function EnvBadge() {
  const classes = useStyles();
  const env = useApi(atlasEnvApiRef);

  return (
    <Tooltip title={`${DESCRIPTION[env.envName]} · v${env.version}`}>
      <Chip
        size="small"
        label={env.envName}
        className={`${classes.chip} ${classes[env.envName]}`}
      />
    </Tooltip>
  );
}
