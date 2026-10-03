import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import {
  cores,
  textoStatus,
  useAtlasStyles,
  verdeTexto,
} from '../shared/styles';

const { brand, status, radius } = atlasTokens;

/** O que só Skills tem: os cartões, os marcadores de ambiente e os textos de ajuda. */
const useSkillsStyles = makeStyles(theme => {
  const c = cores(theme);
  const verde = verdeTexto(theme);
  const chip = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '1px 9px',
    borderRadius: radius.pill,
    fontSize: '0.7rem',
    fontWeight: 700,
  };
  return {
    bar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
      gap: 14,
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '18px 18px 16px',
      borderRadius: radius.lg,
      border: `1px solid ${c.border}`,
      background: c.bgCard,
      color: 'inherit',
      textDecoration: 'none',
      transition: 'border-color .15s, background-color .15s, transform .15s',
      '&:hover': {
        borderColor: brand.limeBorder,
        background: c.bgCardHover,
        transform: 'translateY(-2px)',
        textDecoration: 'none',
      },
      '&:hover $cardTitle': { color: verde },
    },
    cardHead: { display: 'flex', alignItems: 'flex-start', gap: 12 },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      fontSize: '0.86rem',
      fontWeight: 800,
      flexShrink: 0,
    },
    cardTitle: {
      marginBottom: 4,
      fontSize: '0.98rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: c.textPrimary,
    },
    chipRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    envRelease: { ...chip, background: brand.limeBg, color: verde },
    envHml: {
      ...chip,
      background: `${status.warning}24`,
      color: textoStatus(theme, 'warning'),
    },
    envDev: {
      ...chip,
      background: `${status.info}24`,
      color: textoStatus(theme, 'info'),
    },
    desc: {
      flex: 1,
      fontSize: '0.82rem',
      lineHeight: 1.5,
      color: c.textSecondary,
    },
    tag: {
      padding: '3px 9px',
      borderRadius: radius.pill,
      fontSize: '0.7rem',
      fontWeight: 600,
      border: `1px solid ${c.border}`,
      background: c.bgPill,
      color: c.textSecondary,
    },
    muted: { fontSize: '0.74rem', color: c.textMuted },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 16px',
      paddingTop: 10,
      borderTop: `1px solid ${c.border}`,
      fontSize: '0.74rem',
      color: c.textSecondary,
      '& strong': { fontWeight: 600, color: c.textPrimary },
    },
    // ---- diálogos de ajuda
    texto: {
      margin: '0 0 12px',
      fontSize: '0.88rem',
      lineHeight: 1.6,
      color: c.textSecondary,
      '& strong': { color: c.textPrimary },
    },
    subtitulo: {
      margin: '18px 0 8px',
      fontSize: '0.92rem',
      fontWeight: 800,
      color: c.textPrimary,
      '&:first-child': { marginTop: 0 },
    },
    passos: {
      margin: '0 0 12px',
      paddingLeft: 20,
      fontSize: '0.88rem',
      lineHeight: 1.7,
      color: c.textSecondary,
    },
    codigo: {
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.82em',
      padding: '1px 6px',
      borderRadius: 5,
      background: c.bgPill,
      color: c.textPrimary,
    },
    blocoCodigo: {
      margin: '0 0 12px',
      padding: '14px 16px',
      borderRadius: radius.md,
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.8rem',
      lineHeight: 1.6,
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
    ambientesAjuda: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 10,
      margin: '8px 0 4px',
      [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    ambienteAjuda: {
      padding: 12,
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      fontSize: '0.8rem',
      color: c.textSecondary,
      '& strong': {
        display: 'block',
        marginBottom: 4,
        fontSize: '0.78rem',
        letterSpacing: '0.06em',
        color: c.textPrimary,
      },
    },
  };
});

/** Estilos comuns do Atlas + os de Skills. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useSkillsStyles() };
}
