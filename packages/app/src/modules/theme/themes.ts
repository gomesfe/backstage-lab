import {
  createUnifiedTheme,
  genPageTheme,
  palettes,
  shapes,
  type UnifiedTheme,
} from '@backstage/theme';
import {
  atlasTokens,
  type AtlasPalette,
} from '@internal/plugin-components';

/**
 * Tema do Atlas em MUI.
 *
 * Partimos de `palettes.dark` / `palettes.light` do Backstage e sobrescrevemos
 * com os tokens do design. Montar a paleta do zero não compensa: os plugins
 * oficiais leem dezenas de chaves (`status.*`, `banner.*`, `navigation.*`), e
 * a que faltar só aparece quando um plugin renderiza texto invisível.
 */

const { brand, status, radius, fontFamily } = atlasTokens;

/**
 * Cabeçalhos de página chapados, não em gradiente.
 *
 * O Backstage traz cabeçalhos com gradiente colorido; o Atlas usa superfícies
 * sólidas. Passar a mesma cor duas vezes ao `genPageTheme` remove o gradiente
 * sem precisar reescrever o componente de header.
 *
 * `fontColor` importa mais do que parece: plugins como o do scaffolder leem
 * `getPageTheme(...).fontColor` no próprio makeStyles deles, que vence
 * qualquer override de tema. Deixar o branco padrão sobre superfície clara
 * faz o título do card sumir — e o sintoma (card sem título) não sugere
 * em nada que a causa é a cor da fonte do pageTheme.
 */
function pageThemes(color: string, fontColor: string) {
  const flat = (shape: string) =>
    genPageTheme({ colors: [color, color], shape, options: { fontColor } });

  return {
    home: flat(shapes.wave),
    documentation: flat(shapes.wave2),
    tool: flat(shapes.round),
    service: flat(shapes.wave),
    website: flat(shapes.wave),
    library: flat(shapes.wave),
    other: flat(shapes.wave),
    app: flat(shapes.wave),
    apis: flat(shapes.wave2),
    // Lido pelos cabeçalhos de card (ItemCardHeader).
    card: flat(shapes.wave),
  };
}

const typography = {
  htmlFontSize: 16,
  fontFamily,
  // Escala do design: títulos pesados e compactos.
  h1: { fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: -0.4 },
  h2: { fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  h4: { fontSize: 17, fontWeight: 700, marginBottom: 6 },
  h5: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  h6: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
};

function paletteFor(tokens: AtlasPalette, variant: 'light' | 'dark') {
  const base = variant === 'dark' ? palettes.dark : palettes.light;

  return {
    ...base,
    type: variant,
    primary: {
      main: brand.lime,
      dark: brand.limeHover,
      light: brand.lime,
      contrastText: brand.limeText,
    },
    secondary: { main: brand.purple, contrastText: '#ffffff' },
    error: { main: status.danger },
    warning: { main: status.warning },
    success: { main: status.success },
    info: { main: status.info },
    background: {
      default: tokens.bgApp,
      paper: tokens.bgCard,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled: tokens.textMuted,
    },
    divider: tokens.border,
    status: {
      ...base.status,
      ok: status.success,
      warning: status.warning,
      error: status.danger,
      running: status.info,
    },
    navigation: {
      ...base.navigation,
      background: tokens.bgSurface,
      color: tokens.textSecondary,
      indicator: brand.lime,
      selectedColor: tokens.textPrimary,
      navItem: { hoverBackground: tokens.bgPillHover },
    },
  };
}

/** Componentes que o design define de forma diferente do padrão do MUI. */
function componentOverrides(tokens: AtlasPalette) {
  return {
    BackstageHeader: {
      styleOverrides: {
        header: {
          maxWidth: atlasTokens.maxWidth,
          margin: '16px auto 0',
          width: 'calc(100% - 32px)',
          borderRadius: radius.lg,
          border: `1px solid ${tokens.border}`,
          backgroundImage: 'none',
          backgroundColor: tokens.bgCard,
          boxShadow: 'none',
        },
        title: { color: tokens.textPrimary, fontWeight: 800 },
        subtitle: { color: tokens.textSecondary },
        type: { color: tokens.textSecondary },
      },
    },
    // O SidebarPage continua sendo o shell — ele fornece contextos que vários
    // componentes consomem — mas a barra lateral virou barra de topo, então o
    // espaço que ele reserva à esquerda passaria a ser margem morta.
    BackstageSidebarPage: {
      styleOverrides: {
        root: {
          paddingLeft: '0 !important',
          paddingBottom: '0 !important',
        },
      },
    },
    // Largura do shell do Atlas: conteúdo centralizado, com respiro nas bordas.
    BackstageContent: {
      styleOverrides: {
        root: {
          maxWidth: atlasTokens.maxWidth,
          margin: '0 auto',
          width: '100%',
        },
      },
    },
    BackstageHeaderTabs: {
      styleOverrides: {
        tabsWrapper: {
          maxWidth: atlasTokens.maxWidth,
          margin: '0 auto',
          width: '100%',
        },
      },
    },
    // O cabeçalho dos cards do catálogo/scaffolder desenha a cor da fonte a
    // partir do pageTheme, que é sempre branco — feito para o gradiente
    // colorido do Backstage. Com cabeçalhos chapados, branco sobre branco
    // faz o título desaparecer no tema claro. Aqui ele passa a usar a
    // superfície de pill do Atlas com o texto primário.
    BackstageItemCardHeader: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.bgPill,
          color: tokens.textPrimary,
          borderBottom: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${tokens.border}`,
        },
        rounded: { borderRadius: radius.md },
        elevation1: { boxShadow: 'none' },
        elevation2: { boxShadow: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.bgCard,
          borderRadius: radius.lg,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          textTransform: 'none' as const,
          fontWeight: 700,
        },
        contained: { boxShadow: 'none' },
        containedPrimary: {
          '&:hover': { backgroundColor: brand.limeHover },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radius.pill,
          backgroundColor: tokens.bgPill,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${tokens.border}` },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: radius.sm },
      },
    },
  };
}

export const atlasDarkTheme: UnifiedTheme = createUnifiedTheme({
  palette: paletteFor(atlasTokens.dark, 'dark'),
  typography,
  defaultPageTheme: 'home',
  pageTheme: pageThemes(atlasTokens.dark.bgCard, atlasTokens.dark.textPrimary),
  components: componentOverrides(atlasTokens.dark),
});

export const atlasLightTheme: UnifiedTheme = createUnifiedTheme({
  palette: paletteFor(atlasTokens.light, 'light'),
  typography,
  defaultPageTheme: 'home',
  pageTheme: pageThemes(atlasTokens.light.bgCard, atlasTokens.light.textPrimary),
  components: componentOverrides(atlasTokens.light),
});
