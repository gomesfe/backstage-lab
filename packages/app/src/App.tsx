import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { signInModule } from './modules/auth';
import { staticPagesPlugin } from './modules/static-pages';

export default createApp({
  features: [
    catalogPlugin,
    navModule,
    homeModule,
    signInModule,
    staticPagesPlugin,
  ],
});
