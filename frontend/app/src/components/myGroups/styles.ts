import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles } from '../shared/styles';

/** O que só Meus grupos tem: os cartões dos grupos. */
const useMeusGruposStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
      gap: 14,
    },
    cartao: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '18px 18px 16px',
      borderRadius: atlasTokens.radius.lg,
      border: `1px solid ${c.border}`,
      background: c.bgCard,
    },
    selos: { display: 'flex', gap: 6 },
    titulo: { fontSize: '1rem', fontWeight: 800, color: c.textPrimary },
    texto: {
      flex: 1,
      fontSize: '0.84rem',
      lineHeight: 1.5,
      color: c.textSecondary,
    },
    rodape: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    botoes: { display: 'flex', gap: 6, marginLeft: 'auto' },
    esqueleto: { height: 14, borderRadius: 7, background: c.bgPill },
  };
});

/** Estilos comuns do Atlas + os de Meus grupos. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useMeusGruposStyles() };
}
