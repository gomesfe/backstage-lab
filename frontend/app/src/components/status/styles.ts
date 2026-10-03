import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles } from '../shared/styles';

const { brand, status, radius } = atlasTokens;

/** O que só o Status tem: as linhas de serviço e a lista de incidentes. */
const useStatusStyles = makeStyles(theme => {
  const c = cores(theme);
  const ponto = { display: 'inline-block', width: 10, height: 10, borderRadius: '50%', flexShrink: 0 };
  return {
    metricDestaque: { borderColor: brand.limeBorder, background: brand.limeBg },
    cols: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
      gap: 16,
      alignItems: 'start',
      [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
    },
    cardHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
    lista: { display: 'flex', flexDirection: 'column', gap: 4 },
    servico: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: radius.md,
      '&:hover': { background: c.bgCardHover },
    },
    servicoNome: { display: 'block', fontSize: '0.88rem', fontWeight: 700, color: c.textPrimary },
    servicoMeta: { display: 'block', fontSize: '0.76rem', color: c.textMuted },
    numero: { fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem', color: c.textSecondary },
    pontoVerde: { ...ponto, background: brand.lime, boxShadow: `0 0 0 3px ${brand.limeBg}` },
    pontoAmbar: { ...ponto, background: status.warning, boxShadow: `0 0 0 3px ${status.warning}2e` },
    pontoVermelho: { ...ponto, background: status.danger, boxShadow: `0 0 0 3px ${status.danger}2e` },
    incidente: { display: 'flex', gap: 12, padding: '10px 4px', borderBottom: `1px solid ${c.border}`, '&:last-child': { borderBottom: 0 } },
    incidenteTitulo: { fontSize: '0.88rem', fontWeight: 700, color: c.textPrimary },
    incidenteTexto: { fontSize: '0.82rem', color: c.textSecondary },
    incidenteQuando: { marginTop: 4, fontSize: '0.74rem', color: c.textMuted },
  };
});

/** Estilos comuns do Atlas + os do Status. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useStatusStyles() };
}
