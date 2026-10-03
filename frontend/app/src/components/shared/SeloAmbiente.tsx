import { tomDoAmbiente, type Ambiente } from './ambientes';
import { useAtlasStyles } from './styles';

/** Selo do ambiente (dev, perf, int em azul; ext em roxo; prod e prdnv em âmbar). */
export function SeloAmbiente({ ambiente }: { ambiente: Ambiente }) {
  const classes = useAtlasStyles();
  const tom = tomDoAmbiente(ambiente);
  let classe = classes.badgeInfo;
  if (tom === 'warning') classe = classes.badgeWarn;
  if (tom === 'purple') classe = classes.badgePurple;
  return <span className={classe}>{ambiente}</span>;
}
