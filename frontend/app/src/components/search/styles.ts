import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

/** O que só a Busca tem: a lista de resultados. */
const useBuscaStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    resultados: { display: 'flex', flexDirection: 'column', gap: 8 },
    resultado: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: '12px 14px',
      borderRadius: atlasTokens.radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      color: c.textPrimary,
      textDecoration: 'none',
      '&:hover': {
        borderColor: atlasTokens.brand.limeBorder,
        background: c.bgCardHover,
        textDecoration: 'none',
      },
      '&:hover $resultadoTitulo': { color: verdeTexto(theme) },
    },
    resultadoTitulo: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '0.92rem',
      fontWeight: 700,
    },
    trecho: {
      marginTop: 4,
      fontSize: '0.82rem',
      color: c.textSecondary,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    esqueleto: { height: 14, borderRadius: 7, background: c.bgPill },
  };
});

/** Estilos comuns do Atlas + os da Busca. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useBuscaStyles() };
}
