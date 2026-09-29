import { createApp } from '@backstage/frontend-defaults';
import { atlasFeatures } from './atlas';
import { staticPagesPlugin } from './modules/static-pages';

export default createApp({
  features: [
    ...atlasFeatures,
    // Telas em HTML puro de frontend/static-pages (só deste repositório).
    staticPagesPlugin,
  ],
});
