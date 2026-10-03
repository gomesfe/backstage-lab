import { ROTULO_STATUS, TOM_STATUS, type Tom } from './helpers';
import { useStyles } from './styles';
import type { Status } from './types';

/** Selo colorido do status (aguardando, em execução, concluído…). */
export function StatusBadge({ status }: { status: Status }) {
  const classes = useStyles();
  const porTom: Record<Tom, string> = {
    warning: classes.badgeWarn,
    info: classes.badgeInfo,
    lime: classes.badgeLime,
    danger: classes.badgeDanger,
    purple: classes.badgePurple,
    neutral: classes.badge,
  };
  return <span className={porTom[TOM_STATUS[status]]}>{ROTULO_STATUS[status]}</span>;
}
