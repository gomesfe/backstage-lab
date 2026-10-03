import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, radius } = atlasTokens;

/** O que só as Trilhas têm: cartões com progresso, lista de etapas e o texto da etapa. */
const useTrilhasStyles = makeStyles(theme => {
  const c = cores(theme);
  const verde = verdeTexto(theme);
  return {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 },
    cartao: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '18px 18px 16px',
      borderRadius: radius.lg,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      transition: 'border-color .15s',
      '&:hover': { borderColor: brand.limeBorder },
    },
    cartaoTitulo: { fontSize: '1rem', fontWeight: 800, color: c.textPrimary },
    cartaoTexto: { flex: 1, fontSize: '0.84rem', lineHeight: 1.5, color: c.textSecondary },
    rodape: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    tema: { padding: '3px 9px', borderRadius: radius.pill, fontSize: '0.7rem', fontWeight: 600, border: `1px solid ${c.border}`, background: c.bgPill, color: c.textSecondary },
    empurra: { marginLeft: 'auto' },
    progressoRotulo: { display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.76rem', fontWeight: 700, color: c.textSecondary },
    progresso: { height: 6, borderRadius: radius.pill, background: c.bgPill, overflow: 'hidden' },
    progressoBarra: { height: '100%', borderRadius: radius.pill, background: brand.lime, transition: 'width .3s' },
    // ---- detalhe
    migalhas: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.8rem', color: c.textMuted, '& a': { color: c.textSecondary } },
    acoes: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    etapas: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 },
    etapa: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 14px',
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
    },
    etapaProxima: { borderColor: brand.limeBorder, boxShadow: `inset 3px 0 0 ${brand.lime}` },
    etapaFeita: { opacity: 0.72, '& $etapaTitulo': { textDecoration: 'line-through' } },
    check: {
      display: 'grid',
      placeItems: 'center',
      width: 24,
      height: 24,
      flexShrink: 0,
      padding: 0,
      borderRadius: '50%',
      border: `2px solid ${c.borderLight}`,
      background: 'transparent',
      color: brand.limeText,
      cursor: 'pointer',
      '&:hover': { borderColor: brand.lime },
    },
    checkFeito: { borderColor: brand.lime, background: brand.lime },
    etapaCorpo: { flex: 1, minWidth: 0, padding: 0, border: 0, background: 'none', font: 'inherit', textAlign: 'left', color: 'inherit', cursor: 'pointer' },
    etapaTitulo: { display: 'block', fontSize: '0.9rem', fontWeight: 700, color: c.textPrimary },
    etapaResumo: { display: 'block', fontSize: '0.82rem', color: c.textSecondary },
    ler: { padding: 0, border: 0, background: 'none', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, color: verde, cursor: 'pointer', whiteSpace: 'nowrap' },
    concluida: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16, padding: '14px 16px', borderRadius: radius.md, border: `1px solid ${brand.limeBorder}`, background: brand.limeBg },
    // ---- texto da etapa
    prosa: {
      fontSize: '0.9rem',
      lineHeight: 1.65,
      color: c.textSecondary,
      '& h4': { margin: '18px 0 6px', fontSize: '0.95rem', fontWeight: 800, color: c.textPrimary },
      '& p': { margin: '0 0 10px' },
      '& ul': { margin: '0 0 10px', paddingLeft: 20 },
    },
  };
});

/** Estilos comuns do Atlas + os das Trilhas. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useTrilhasStyles() };
}
