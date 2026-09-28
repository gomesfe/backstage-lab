import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import adminPlugin from '@internal/plugin-admin';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { signInModule } from './modules/auth';
import { envModule } from './modules/env';
import { themeModule } from './modules/theme';
import { atlasPagesPlugin, pageOverrides } from './modules/pages';
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
    homeModule,
    signInModule,
    staticPagesPlugin,
    translationsModule,
    // Substituem as páginas de índice dos plugins oficiais.
    ...pageOverrides,
  ],
});
