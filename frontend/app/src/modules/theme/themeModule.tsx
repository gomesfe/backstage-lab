import { createFrontendModule } from '@backstage/frontend-plugin-api';
import {
  AppRootWrapperBlueprint,
  ThemeBlueprint,
} from '@backstage/plugin-app-react';
import { AtlasRootWrapper } from './AtlasRootWrapper';
import { UnifiedThemeProvider } from '@backstage/theme';
import LightIcon from '@material-ui/icons/WbSunny';
import DarkIcon from '@material-ui/icons/Brightness2';
import { atlasDarkTheme, atlasLightTheme } from './themes';

const lightTheme = ThemeBlueprint.make({
  // Mesmo nome do tema padrão do Backstage ('light'), de propósito: extensões
  // com o mesmo id substituem a original. Sem isso, o Atlas vira uma dupla
  // extra na lista, e o AppThemeSelector continua escolhendo o tema azul
  // padrão pela preferência do sistema operacional, não pelo nosso.
  name: 'light',
  params: {
    theme: {
      id: 'light',
      title: 'Atlas claro',
      variant: 'light',
      icon: <LightIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={atlasLightTheme}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

const darkTheme = ThemeBlueprint.make({
  name: 'dark',
  params: {
    theme: {
      id: 'dark',
      title: 'Atlas escuro',
      variant: 'dark',
      icon: <DarkIcon />,
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={atlasDarkTheme}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  },
});

/** Aplica o `.atlas-root` do design system em volta de toda a app. */
const rootWrapper = AppRootWrapperBlueprint.make({
  name: 'atlas-root',
  params: {
    component: ({ children }) => <AtlasRootWrapper>{children}</AtlasRootWrapper>,
  },
});

export const themeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [lightTheme, darkTheme, rootWrapper],
});
