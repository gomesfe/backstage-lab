/**
 * Atlas — telas, componentes, barra, tema e CSS numa pasta só.
 *
 * Para levar para outro app Backstage (novo sistema de frontend), copie esta
 * pasta inteira e passe `atlasFeatures` ao `createApp`. Detalhes em README.md.
 */

// CSS, nesta ordem: BUI, tokens do Atlas por cima dela, design system por
// cima de tudo. Importado aqui para a pasta funcionar sozinha.
import '@backstage/ui/css/styles.css';
import './assets/bui-tokens.css';
import './assets/atlas.css';
import './assets/atlas-html.css';

import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { adminPlugin, atlasPagesPlugin, pageOverrides } from './screens';
import { navModule } from './shell/nav';
import { signInModule } from './shell/auth';
import { envModule } from './shell/env';
import { themeModule } from './shell/theme';
import { translationsModule } from './shell/translations';

export const atlasFeatures = [
  catalogPlugin,
  adminPlugin,
  atlasPagesPlugin,
  envModule,
  themeModule,
  navModule,
  signInModule,
  translationsModule,
  // Telas do Atlas que substituem as páginas de índice dos plugins oficiais.
  ...pageOverrides,
];

export * from './components';
