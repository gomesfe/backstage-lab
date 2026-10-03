import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { useAtlasStyles } from '../shared/styles';

/** O que só o Break Glass tem: as duas colunas e a lista "Como funciona". */
const useBreakGlassStyles = makeStyles(theme => ({
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
    gap: 16,
    alignItems: 'start',
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },
  item: { display: 'flex', gap: 12, padding: '8px 0' },
  ponto: { marginTop: 2, color: atlasTokens.brand.lime },
}));

/** Estilos comuns do Atlas + os do Break Glass. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useBreakGlassStyles() };
}
