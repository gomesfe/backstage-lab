import { useAtlasStyles } from './styles';

/** Selo do ciclo de vida: production verde, experimental roxo, deprecated vermelho. */
export function SeloCiclo({ ciclo }: { ciclo: string }) {
  const classes = useAtlasStyles();
  let classe = classes.badge;
  if (ciclo === 'production') classe = classes.badgeLime;
  if (ciclo === 'experimental') classe = classes.badgePurple;
  if (ciclo === 'deprecated') classe = classes.badgeDanger;
  return <span className={classe}>{ciclo}</span>;
}
