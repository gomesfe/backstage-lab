import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { adminPlugin, atlasPagesPlugin, pageOverrides } from './screens';
import { navModule } from './modules/nav';
import { signInModule } from './modules/auth';
import { envModule } from './modules/env';
import { themeModule } from './modules/theme';
import { staticPagesPlugin } from './modules/static-pages';
import { translationsModule } from './modules/translations';

export default createApp({
  features: [
    catalogPlugin,
    adminPlugin,
    atlasPagesPlugin,
    envModule,
    themeModule,
    navModule,
    signInModule,
    staticPagesPlugin,
    translationsModule,
    // Telas do Atlas que substituem as páginas de índice dos plugins oficiais.
    ...pageOverrides,
  ],
});
