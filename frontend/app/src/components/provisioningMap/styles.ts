import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, textoStatus, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, status, radius } = atlasTokens;

/** O que só o mapa tem: a faixa de regras e a célula de cada ambiente. */
const useMapaStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    rule: {
      padding: '14px 18px',
      borderRadius: radius.md,
      border: `1px solid ${status.warning}55`,
      background: `${status.warning}14`,
      color: c.textSecondary,
      fontSize: '0.86rem',
    },
    ruleTitle: { display: 'block', marginBottom: 2, fontWeight: 700, color: c.textPrimary },
    badgeIac: { padding: '2px 9px', borderRadius: radius.pill, fontSize: '0.7rem', fontWeight: 700, background: brand.limeBg, color: verdeTexto(theme) },
    badgeSemIac: { padding: '2px 9px', borderRadius: radius.pill, fontSize: '0.7rem', fontWeight: 700, background: `${status.info}22`, color: textoStatus(theme, 'info') },
    envCell: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 92 },
    envDate: { fontSize: '0.74rem', color: c.textSecondary, fontVariantNumeric: 'tabular-nums' },
    envEmpty: { fontSize: '0.74rem', color: c.textMuted, opacity: 0.6 },
  };
});

/** Estilos comuns do Atlas + os do mapa. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useMapaStyles() };
}
