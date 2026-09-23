import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../theme';

const { brand, radius, maxWidth } = atlasTokens;

/**
 * As primitivas visuais da Home, portadas de `atlas.css`.
 *
 * Ficam num hook compartilhado porque o design repete as mesmas formas em
 * todas as seções — card de seção, pílula, item de lista. Duplicar isso por
 * componente é o caminho mais curto para elas divergirem.
 */
export const useAtlasStyles = makeStyles(theme => {
  const border = theme.palette.divider;
  const card = theme.palette.background.paper;
  const muted = theme.palette.text.disabled;

  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth,
      margin: '0 auto',
      width: '100%',
      [theme.breakpoints.down('sm')]: { gap: 16 },
    },

    /* ---- card de seção ---- */
    sectionCard: {
      backgroundColor: card,
      border: `1px solid ${border}`,
      borderRadius: radius.lg,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: '100%',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '0.95rem',
      fontWeight: 700,
      color: theme.palette.text.primary,
      margin: 0,
    },

    /* ---- pílula ---- */
    pill: {
      border: `1px solid ${border}`,
      background: 'transparent',
      color: theme.palette.text.secondary,
      borderRadius: radius.pill,
      padding: '6px 12px',
      fontSize: '0.78rem',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      '&:hover': {
        background: theme.palette.action.hover,
        color: theme.palette.text.primary,
        transform: 'translateY(-1px)',
      },
    },
    pillActive: {
      background: brand.lime,
      borderColor: brand.lime,
      color: brand.limeText,
      boxShadow: `0 2px 8px ${brand.limeBg}`,
      '&:hover': { background: brand.lime, color: brand.limeText },
    },

    /* ---- listas ---- */
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxHeight: 260,
      overflowY: 'auto',
      paddingRight: 4,
    },
    listItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      paddingBottom: 10,
      borderBottom: `1px solid ${border}`,
      '&:last-child': { borderBottom: 0, paddingBottom: 0 },
    },
    itemText: {
      fontSize: '0.82rem',
      color: theme.palette.text.primary,
      lineHeight: 1.4,
    },
    itemMeta: { fontSize: '0.72rem', color: muted },
    link: {
      fontSize: '0.78rem',
      fontWeight: 700,
      color: brand.lime,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      '&:hover': { textDecoration: 'underline' },
    },
    empty: {
      fontSize: '0.82rem',
      color: muted,
      padding: '12px 0',
    },

    /* ---- grids ---- */
    threeColumns: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 16,
      [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr 1fr' },
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
    },
    twoThirds: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 16,
      alignItems: 'start',
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
    },
  };
});
