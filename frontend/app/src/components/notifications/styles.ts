import { makeStyles } from '@material-ui/core/styles';
import { atlasTokens } from '../../atlas/components/tokens';
import { cores, textoStatus, useAtlasStyles } from '../shared/styles';

const { brand, status, radius } = atlasTokens;

/** O que só Notificações tem: a lista agrupada por dia, com a cor da severidade. */
const useNotificacoesStyles = makeStyles(theme => {
  const c = cores(theme);
  const faixa = (cor: string, fundo: string, texto: string) => ({
    '&::before': { background: cor },
    '& $icone': { background: fundo, color: texto },
  });
  return {
    grupo: { display: 'flex', flexDirection: 'column', gap: 8 },
    grupoRotulo: {
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: c.textMuted,
    },
    lista: { display: 'flex', flexDirection: 'column', gap: 8 },
    item: {
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '14px 16px 14px 18px',
      borderRadius: radius.md,
      border: `1px solid ${c.border}`,
      background: c.bgSurface,
      '&:hover': { borderColor: c.borderLight },
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: 10,
        width: 3,
        borderRadius: 3,
        background: c.borderLight,
      },
      [theme.breakpoints.down('xs')]: { flexWrap: 'wrap' },
    },
    naoLida: {
      background: c.bgCard,
      borderColor: brand.limeBorder,
      '& $titulo': { fontWeight: 800 },
    },
    critical: faixa(
      status.danger,
      `${status.danger}24`,
      textoStatus(theme, 'danger'),
    ),
    high: faixa(
      status.warning,
      `${status.warning}24`,
      textoStatus(theme, 'warning'),
    ),
    normal: faixa(status.info, `${status.info}24`, textoStatus(theme, 'info')),
    low: faixa(c.textMuted, c.bgPill, c.textSecondary),
    icone: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 34,
      flexShrink: 0,
      borderRadius: 10,
      background: c.bgPill,
      color: c.textSecondary,
    },
    corpo: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    titulo: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: '0.9rem',
      fontWeight: 600,
      color: c.textPrimary,
      '& a': { color: 'inherit' },
    },
    ponto: {
      width: 8,
      height: 8,
      flexShrink: 0,
      borderRadius: '50%',
      background: brand.lime,
    },
    descricao: {
      fontSize: '0.83rem',
      lineHeight: 1.5,
      color: c.textSecondary,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    meta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 10px',
      marginTop: 2,
      fontSize: '0.74rem',
      color: c.textMuted,
    },
    acoes: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flexShrink: 0,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        justifyContent: 'flex-end',
      },
    },
    salva: { color: brand.lime, '&:hover': { color: brand.lime } },
    rodape: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    esqueleto: { height: 14, borderRadius: 7, background: c.bgPill },
  };
});

/** Estilos comuns do Atlas + os de Notificações. */
export function useStyles() {
  return { ...useAtlasStyles(), ...useNotificacoesStyles() };
}
