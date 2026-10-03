import type { Tom } from './helpers';
import { useStyles } from './styles';

/** Selo colorido (tipo da issue, status do card). */
export function Selo({ tom, children }: { tom: Tom; children: string }) {
  const classes = useStyles();
  const porTom: Record<Tom, string> = {
    danger: classes.badgeDanger,
    lime: classes.badgeLime,
    info: classes.badgeInfo,
    purple: classes.badgePurple,
    warning: classes.badgeWarn,
  };
  return <span className={porTom[tom]}>{children}</span>;
}
