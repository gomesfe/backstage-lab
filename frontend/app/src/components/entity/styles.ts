import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só a tela de Entidade tem: as duas colunas, os campos e as listas de relações. */
const useEntidadeStyles = makeStyles(theme => {
  const c = cores(theme);
  const verde = verdeTexto(theme);
  return {
    migalhas: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
      fontSize: '0.8rem',
      color: c.textMuted,
      '& a': { color: c.textSecondary },
    },
    acoes: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    colunas: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
      gap: 16,
      alignItems: 'start',
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'minmax(0, 1fr)' },
    },
    pilha: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
    texto: {
      margin: 0,
      fontSize: '0.9rem',
      lineHeight: 1.55,
      color: c.textSecondary,
    },
    campos: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '14px 18px',
      [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    valor: {
      display: 'block',
      marginTop: 4,
      fontSize: '0.9rem',
      fontWeight: 600,
      color: c.textPrimary,
      '& a': { color: verde },
    },
    botoes: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    lista: { display: 'flex', flexDirection: 'column', gap: 6 },
    item: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      padding: '10px 12px',
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      color: c.textPrimary,
      textDecoration: 'none',
      '&:hover': { borderColor: brand.limeBorder, textDecoration: 'none' },
      '&:hover $itemNome': { color: verde },
    },
    itemNome: { display: 'block', fontSize: '0.88rem', fontWeight: 700 },
    itemMeta: { display: 'block', fontSize: '0.76rem', color: c.textSecondary },
    prosa: {
      fontSize: '0.9rem',
      lineHeight: 1.65,
      color: c.textSecondary,
      '& h4': {
        margin: '16px 0 6px',
        fontSize: '0.95rem',
        fontWeight: 800,
        color: c.textPrimary,
      },
      '& h4:first-child': { marginTop: 0 },
      '& p': { margin: '0 0 10px' },
      '& ul': { margin: '0 0 10px', paddingLeft: 20 },
      '& code': {
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: '0.84em',
        padding: '1px 6px',
        borderRadius: 5,
        background: c.bgPill,
        color: c.textPrimary,
      },
      '& a': { color: verde, fontWeight: 600 },
    },
    definicao: {
      margin: 0,
      maxHeight: 360,
      overflow: 'auto',
      padding: '14px 16px',
      borderRadius: radius.md,
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.8rem',
      lineHeight: 1.6,
      whiteSpace: 'pre',
    },
  };
});

/** Estilos comuns do Atlas + os da tela de Entidade. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useEntidadeStyles() };
}
