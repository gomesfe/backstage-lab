import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só Atlas × Jira tem: o menu lateral das seções e os campos só leitura. */
const useAtlasJiraStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    layout: {
      display: 'grid',
      gridTemplateColumns: '220px minmax(0, 1fr)',
      gap: 16,
      alignItems: 'start',
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
    },
    menu: { padding: 10, gap: 4 },
    item: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      width: '100%',
      padding: '9px 12px',
      borderRadius: radius.sm,
      border: '1px solid transparent',
      background: 'transparent',
      color: c.textSecondary,
      font: 'inherit',
      fontSize: '0.86rem',
      fontWeight: 600,
      textAlign: 'left',
      cursor: 'pointer',
      '&:hover': { background: c.bgSurface, color: c.textPrimary },
    },
    itemAtivo: {
      background: brand.limeBg,
      borderColor: brand.limeBorder,
      color: c.textPrimary,
      '&:hover': { background: brand.limeBg },
    },
    origem: {
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.78rem',
      color: c.textSecondary,
    },
    tituloBotao: {
      padding: 0,
      border: 0,
      background: 'none',
      font: 'inherit',
      fontWeight: 700,
      textAlign: 'left',
      color: c.textPrimary,
      cursor: 'pointer',
      '&:hover': { color: verdeTexto(theme), textDecoration: 'underline' },
    },
    leitura: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '12px 18px',
      padding: 14,
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    valor: {
      display: 'block',
      marginTop: 2,
      fontSize: '0.88rem',
      fontWeight: 600,
      color: c.textPrimary,
      overflowWrap: 'anywhere',
    },
  };
});

/** Estilos comuns do Atlas + os de Atlas × Jira. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useAtlasJiraStyles() };
}
