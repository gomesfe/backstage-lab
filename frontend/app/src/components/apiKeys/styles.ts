import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, textoStatus, useAtlasStyles } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só API Keys tem: o segredo em destaque e o número em alerta. */
const useApiKeysStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    segredo: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 14,
      padding: '12px 14px',
      borderRadius: radius.md,
      border: `1px solid ${brand.limeBorder}`,
      background: brand.limeBg,
    },
    segredoTexto: {
      flex: 1,
      minWidth: 0,
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.84rem',
      color: c.textPrimary,
      overflowWrap: 'anywhere',
      userSelect: 'all',
    },
    prefixo: {
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.8rem',
      color: c.textSecondary,
    },
    alerta: { color: textoStatus(theme, 'warning') },
    confirmar: { fontSize: '0.78rem', color: c.textMuted },
  };
});

/** Estilos comuns do Atlas + os de API Keys. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useApiKeysStyles() };
}
