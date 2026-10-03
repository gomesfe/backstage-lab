import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só Configurações tem: cartões de opção, amostra do tema e linhas de ajuste. */
const useConfiguracoesStyles = makeStyles(theme => {
  const c = cores(theme);
  return {
    opcoes: { display: 'flex', gap: 12, flexWrap: 'wrap' },
    opcao: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 200,
      padding: '12px 14px',
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      color: c.textPrimary,
      font: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      '&:hover': { borderColor: c.borderLight },
    },
    opcaoMarcada: { borderColor: brand.limeBorder, background: brand.limeBg },
    opcaoTitulo: { fontSize: '0.88rem', fontWeight: 700 },
    marca: {
      display: 'grid',
      placeItems: 'center',
      width: 20,
      height: 20,
      marginLeft: 'auto',
      borderRadius: '50%',
      border: `2px solid ${c.borderLight}`,
      fontSize: '0.7rem',
      fontWeight: 800,
      color: brand.limeText,
    },
    marcaCheia: { borderColor: brand.lime, background: brand.lime },
    amostra: {
      display: 'inline-flex',
      width: 40,
      height: 28,
      overflow: 'hidden',
      borderRadius: 8,
      border: `1px solid ${c.border}`,
      '& span': { flex: 1 },
    },
    linha: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '14px 0',
      borderTop: `1px solid ${c.border}`,
      '&:first-child': { borderTop: 0 },
    },
    linhaTitulo: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: 700,
      color: c.textPrimary,
    },
    linhaTexto: {
      display: 'block',
      fontSize: '0.8rem',
      color: c.textSecondary,
    },
    valor: {
      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
      fontSize: '0.8rem',
      color: c.textSecondary,
      textAlign: 'right',
      overflowWrap: 'anywhere',
    },
    perfil: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      paddingBottom: 14,
    },
    avatar: {
      width: 44,
      height: 44,
      fontSize: '0.9rem',
      fontWeight: 800,
      background: brand.limeBg,
      color: verdeTexto(theme),
    },
  };
});

/** Estilos comuns do Atlas + os de Configurações. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useConfiguracoesStyles() };
}
