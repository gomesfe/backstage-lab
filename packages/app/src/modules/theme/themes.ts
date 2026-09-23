import {
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
  type UnifiedTheme,
} from '@backstage/theme';

/**
 * Tema do Atlas.
 *
 * Duas decisões que valem explicação:
 *
 * 1. Partimos de `palettes.light` / `palettes.dark` do Backstage em vez de
 *    escrever a paleta inteira. Os plugins oficiais leem dezenas de chaves
 *    (`status.*`, `banner.*`, `navigation.*`); montar tudo à mão significa
 *    descobrir a que faltou quando um plugin renderiza texto invisível.
 *
 * 2. O verde-petróleo é da Núclea e fica no primary. O accent de destaque é
 *    separado do primary de propósito: botão primário e link precisam de
 *    contraste diferente sobre a mesma superfície.
 */

const ATLAS = {
  teal: '#0a6b5e',
  tealLight: '#38a390',
  tealDark: '#044d43',
  ink: '#0d1b1a',
  accent: '#c2410c',
};

/** Cabeçalhos de página. Um gradiente por família, para dar orientação. */
function pageThemes(primary: string, secondary: string) {
  return {
    home: genPageTheme({ colors: [primary, secondary], shape: shapes.wave },),
    documentation: genPageTheme({
      colors: [primary, secondary],
      shape: shapes.wave2,
    }),
    tool: genPageTheme({ colors: [primary, secondary], shape: shapes.round }),
    service: genPageTheme({
      colors: [primary, secondary],
      shape: shapes.wave,
    }),
    website: genPageTheme({ colors: [primary, secondary], shape: shapes.wave }),
    library: genPageTheme({ colors: [primary, secondary], shape: shapes.wave }),
    other: genPageTheme({ colors: [primary, secondary], shape: shapes.wave }),
    app: genPageTheme({ colors: [primary, secondary], shape: shapes.wave }),
    apis: genPageTheme({ colors: [primary, secondary], shape: shapes.wave2 }),
  };
}

const typography = {
  htmlFontSize: 16,
  fontFamily:
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  h1: { fontSize: 54, fontWeight: 700, marginBottom: 10, letterSpacing: -1 },
  h2: { fontSize: 38, fontWeight: 700, marginBottom: 10, letterSpacing: -0.5 },
  h3: { fontSize: 28, fontWeight: 700, marginBottom: 10 },
  h4: { fontSize: 22, fontWeight: 700, marginBottom: 10 },
  h5: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  h6: { fontSize: 16, fontWeight: 700, marginBottom: 10 },
};

export const customThemeAtlas: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: { main: ATLAS.teal, light: ATLAS.tealLight, dark: ATLAS.tealDark },
    secondary: { main: ATLAS.accent },
    navigation: {
      ...palettes.light.navigation,
      background: ATLAS.ink,
      indicator: ATLAS.tealLight,
      color: '#d6dedd',
      selectedColor: '#ffffff',
    },
  },
  typography,
  defaultPageTheme: 'home',
  pageTheme: pageThemes(ATLAS.teal, ATLAS.tealDark),
});

export const darkThemeAtlas: UnifiedTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: { main: ATLAS.tealLight, light: '#6fc3b3', dark: ATLAS.teal },
    secondary: { main: '#f97316' },
    navigation: {
      ...palettes.dark.navigation,
      background: '#060d0c',
      indicator: ATLAS.tealLight,
    },
  },
  typography,
  defaultPageTheme: 'home',
  pageTheme: pageThemes(ATLAS.tealDark, '#02231e'),
});
