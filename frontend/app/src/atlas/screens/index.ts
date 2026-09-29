import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import * as home from './home/page';
import * as catalog from './catalog/page';
import * as myGroups from './my-groups/page';
import * as approvals from './approvals/page';
import * as apis from './apis/page';
import * as docs from './docs/page';
import * as learningPaths from './learning-paths/page';
import * as create from './create/page';
import * as provisioningMap from './provisioning-map/page';
import * as breakGlass from './break-glass/page';
import * as atlasJira from './atlas-jira/page';
import * as agent from './agent/page';
import * as apiKeys from './api-keys/page';
import * as admin from './admin/page';
import * as search from './search/page';
import * as notifications from './notifications/page';
import * as settings from './settings/page';

/**
 * Todas as telas do portal, montadas a partir do `page.tsx` de cada pasta.
 *
 * Três formas de registro, conforme a origem da rota:
 *
 * - **Substitui a página de um plugin oficial** (Home, Catálogo, APIs, Docs,
 *   Ofertas, Buscar, Notificações, Configurações): a tela exporta um
 *   `pageModule` com o `pluginId` do plugin original.
 * - **Tela nova do Atlas**: entra no plugin `atlas-pages` (ids
 *   `page:atlas-pages/<nome>`).
 * - **API Keys e Administração**: plugin `admin`.
 *
 * Tela nova: crie a pasta com `page.tsx` e acrescente aqui. A ordem da barra
 * de navegação fica em `shell/nav/AtlasTopNav.tsx` (`PILL_ORDER`).
 */

export const pageOverrides = [
  home.pageModule,
  catalog.pageModule,
  apis.pageModule,
  docs.pageModule,
  create.pageModule,
  search.pageModule,
  notifications.pageModule,
  settings.pageModule,
];

export const atlasPagesPlugin = createFrontendPlugin({
  pluginId: 'atlas-pages',
  routes: {
    myGroups: myGroups.myGroupsRouteRef,
    approvals: approvals.approvalsRouteRef,
    provisioningMap: provisioningMap.provisioningMapRouteRef,
    atlasJira: atlasJira.atlasJiraRouteRef,
    agent: agent.agentRouteRef,
    learningPaths: learningPaths.learningPathsRouteRef,
    breakGlass: breakGlass.breakGlassRouteRef,
  },
  extensions: [
    myGroups.page,
    approvals.page,
    provisioningMap.page,
    atlasJira.page,
    agent.page,
    learningPaths.page,
    learningPaths.detailPage,
    breakGlass.page,
  ],
});

export const adminPlugin = createFrontendPlugin({
  pluginId: 'admin',
  routes: { root: admin.adminRouteRef, apiKeys: apiKeys.apiKeysRouteRef },
  extensions: [apiKeys.page, admin.page],
});
