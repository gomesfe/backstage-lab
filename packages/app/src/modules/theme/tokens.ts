/**
 * Tokens do Atlas Design System.
 *
 * Portados de `src/styles/atlas.css` do redesign no Figma Make. O próprio
 * arquivo de origem diz que a fonte de verdade dele era o `styles.ts`
 * (makeStyles) do portal Backstage — ou seja, o design nasceu em MUI e está
 * voltando para MUI. Os valores abaixo são cópia literal, não aproximação.
 *
 * O tema escuro é o padrão do Atlas; o claro é a variante.
 */

export const atlasTokens = {
  dark: {
    bgApp: '#0b0c0e',
    bgSurface: '#141518',
    bgCard: '#1a1b1f',
    bgCardHover: '#222429',
    bgPill: '#25272e',
    bgPillHover: '#2d3038',
    border: 'rgba(255, 255, 255, 0.07)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: '#9ea3b0',
    textMuted: '#626775',
  },
  light: {
    bgApp: '#f2f4f7',
    bgSurface: '#ffffff',
    bgCard: '#f8fafc',
    bgCardHover: '#f1f5f9',
    bgPill: '#e2e8f0',
    bgPillHover: '#cbd5e1',
    border: 'rgba(0, 0, 0, 0.08)',
    borderLight: 'rgba(0, 0, 0, 0.15)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
  },

  /** Cores de marca e de status, iguais nos dois temas. */
  brand: {
    lime: '#44a844',
    limeHover: '#389338',
    limeText: '#ffffff',
    limeBg: 'rgba(68, 168, 68, 0.16)',
    limeBorder: 'rgba(68, 168, 68, 0.35)',
    purple: '#9d7bff',
    purpleBg: 'rgba(157, 123, 255, 0.15)',
  },

  status: {
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#ff5252',
    info: '#60a5fa',
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 24,
    pill: 9999,
  },

  /** O redesign usa a pilha de sistema, não uma fonte carregada. */
  fontFamily: 'Arial, Helvetica, sans-serif',

  /** Largura máxima do conteúdo no shell do Atlas. */
  maxWidth: 1440,
} as const;

/**
 * As chaves de superfície/texto que mudam entre claro e escuro. Tipo largo de
 * propósito: com `as const`, `typeof atlasTokens.dark` fixaria os literais e
 * a paleta clara não seria atribuível.
 */
export type AtlasPalette = {
  bgApp: string;
  bgSurface: string;
  bgCard: string;
  bgCardHover: string;
  bgPill: string;
  bgPillHover: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
};
