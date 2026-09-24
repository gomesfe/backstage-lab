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
  // Tema claro refinado (ver atlas-refinements.css): cartão branco sobre
  // fundo cinza. O original tinha cartão cinza e superfície interna branca,
  // o que tirava a separação entre níveis. Mantenha os dois arquivos juntos.
  light: {
    bgApp: '#f3f5f8',
    bgSurface: '#f7f9fb',
    bgCard: '#ffffff',
    bgCardHover: '#f1f4f8',
    bgPill: '#eef1f5',
    bgPillHover: '#e3e8ef',
    border: 'rgba(15, 23, 42, 0.08)',
    borderLight: 'rgba(15, 23, 42, 0.14)',
    textPrimary: '#0f172a',
    textSecondary: '#4b5567',
    textMuted: '#8a94a6',
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
  fontFamily: "Inter, 'Segoe UI', Arial, Helvetica, sans-serif",

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
