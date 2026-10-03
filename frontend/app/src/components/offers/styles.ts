import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só Ofertas tem: grupos por categoria e os cartões das ofertas. */
const useOfertasStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    acoes: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    barra: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      flexWrap: 'wrap',
    },
    grupos: { display: 'flex', flexDirection: 'column', gap: 20 },
    grupo: { display: 'flex', flexDirection: 'column', gap: 12 },
    grupoTitulo: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: 0,
      fontSize: '1.05rem',
      fontWeight: 800,
      color: c.textPrimary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 14,
    },
    cartao: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '18px 18px 16px',
      borderRadius: radius.lg,
      border: `1px solid ${c.border}`,
      background: c.bgCard,
      transition: 'border-color .15s, transform .15s',
      '&:hover': {
        borderColor: brand.limeBorder,
        transform: 'translateY(-2px)',
      },
    },
    cartaoTitulo: {
      fontSize: '0.98rem',
      fontWeight: 700,
      color: c.textPrimary,
    },
    cartaoTexto: {
      flex: 1,
      fontSize: '0.82rem',
      lineHeight: 1.5,
      color: c.textSecondary,
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    rodape: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    empurra: { marginLeft: 'auto' },
    esqueleto: { height: 14, borderRadius: 7, background: c.bgPill },
  };
});

/** Estilos comuns do Atlas + os de Ofertas. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useOfertasStyles() };
}
