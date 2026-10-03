import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, useAtlasStyles, verdeTexto } from '../shared/styles';

const { brand, status, radius } = atlasTokens;

/** O que só Aprovações tem: barra de aprovações, grupos aprovadores e andamento. */
const useAprovacoesStyles = makeStyles(theme => {
  const c = cores(theme);
  const ponto = {
    position: 'absolute' as const,
    left: 0,
    top: 1,
    display: 'grid',
    placeItems: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    fontSize: '0.66rem',
    fontWeight: 800,
    border: `2px solid ${c.borderLight}`,
    background: c.bgCard,
    color: c.textMuted,
  };
  return {
    statusBar: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    },
    statusTabs: { padding: 3 },
    statusTab: { padding: '6px 14px', fontSize: '0.8rem' },
    progressLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '12px 0 6px',
      fontSize: '0.76rem',
      fontWeight: 700,
      color: c.textSecondary,
    },
    progress: {
      height: 6,
      borderRadius: radius.pill,
      background: c.bgPill,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: radius.pill,
      background: status.warning,
      transition: 'width .3s',
    },
    approvers: { display: 'flex', flexDirection: 'column', gap: 8 },
    approver: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '10px 12px',
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgCard,
    },
    approverName: { fontWeight: 700, color: c.textPrimary },
    approverNote: { fontSize: '0.78rem', color: c.textSecondary },
    quote: {
      margin: '12px 0',
      padding: '10px 14px',
      borderLeft: `3px solid ${brand.lime}`,
      borderRadius: `0 ${radius.md}px ${radius.md}px 0`,
      background: c.bgSurface,
      fontSize: '0.86rem',
      color: c.textSecondary,
      '& strong': {
        display: 'block',
        marginBottom: 2,
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: c.textMuted,
      },
    },
    stack: { display: 'flex', flexDirection: 'column', gap: 12 },
    timeline: { listStyle: 'none', margin: 0, padding: 0 },
    step: {
      position: 'relative',
      padding: '0 0 14px 32px',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 9,
        top: 22,
        bottom: 0,
        width: 2,
        background: c.border,
      },
      '&:last-child': { paddingBottom: 0 },
      '&:last-child::before': { display: 'none' },
    },
    dot: ponto,
    dotFeito: {
      ...ponto,
      borderColor: brand.lime,
      background: brand.lime,
      color: brand.limeText,
    },
    dotAgora: {
      ...ponto,
      borderColor: status.warning,
      boxShadow: `0 0 0 4px ${status.warning}26`,
    },
    dotFalhou: {
      ...ponto,
      borderColor: status.danger,
      background: status.danger,
      color: '#fff',
    },
    dotCancelado: {
      ...ponto,
      borderColor: c.textMuted,
      background: c.textMuted,
      color: c.bgCard,
    },
    stepTitle: { fontSize: '0.86rem', fontWeight: 700, color: c.textPrimary },
    stepTitlePendente: { fontWeight: 600, color: c.textMuted },
    stepNote: { fontSize: '0.78rem', color: c.textSecondary },
    readonly: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '12px 18px',
      padding: 14,
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    readonlyValue: {
      display: 'block',
      marginTop: 2,
      fontSize: '0.88rem',
      fontWeight: 600,
      color: c.textPrimary,
      overflowWrap: 'anywhere',
    },
    erro: { fontSize: '0.76rem', color: status.danger },
    verde: { color: verdeTexto(theme) },
  };
});

/** Estilos comuns do Atlas + os de Aprovações. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useAprovacoesStyles() };
}
