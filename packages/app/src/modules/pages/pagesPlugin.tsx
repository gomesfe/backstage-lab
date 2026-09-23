import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import GroupsIcon from '@material-ui/icons/People';
import CatalogIcon from '@material-ui/icons/Widgets';
import SchoolIcon from '@material-ui/icons/School';
import ShieldIcon from '@material-ui/icons/ReportProblemOutlined';

/**
 * Telas do Atlas que não existem no Backstage padrão.
 *
 * Cada página expõe um `routeRef`: sem ele a rota funciona mas o item some da
 * navegação, porque o item de nav só é criado para páginas que têm uma.
 *
 * O detalhe da trilha não ganha routeRef de propósito — é uma sub-rota, e um
 * item de navegação para "detalhe de trilha" sem trilha escolhida não tem
 * para onde apontar.
 */

export const myGroupsRouteRef = createRouteRef();
export const catalogV2RouteRef = createRouteRef();
export const learningPathsRouteRef = createRouteRef();
export const breakGlassRouteRef = createRouteRef();

const myGroupsPage = PageBlueprint.make({
  name: 'my-groups',
  params: {
    path: '/my-groups',
    routeRef: myGroupsRouteRef,
    title: 'Meus grupos',
    icon: <GroupsIcon />,
    noHeader: true,
    loader: async () => {
      const { MyGroupsPage } = await import('./MyGroupsPage');
      return <MyGroupsPage />;
    },
  },
});

const catalogV2Page = PageBlueprint.make({
  name: 'catalog-v2',
  params: {
    path: '/catalog-v2',
    routeRef: catalogV2RouteRef,
    title: 'Catálogo V2',
    icon: <CatalogIcon />,
    noHeader: true,
    loader: async () => {
      const { CatalogV2Page } = await import('./CatalogV2Page');
      return <CatalogV2Page />;
    },
  },
});

const learningPathsPage = PageBlueprint.make({
  name: 'learning-paths',
  params: {
    path: '/learning-paths',
    routeRef: learningPathsRouteRef,
    title: 'Trilhas',
    icon: <SchoolIcon />,
    noHeader: true,
    loader: async () => {
      const { LearningPathsPage } = await import('./LearningPathsPage');
      return <LearningPathsPage />;
    },
  },
});

const learningPathDetailPage = PageBlueprint.make({
  name: 'learning-path-detail',
  params: {
    path: '/learning-paths/:pathId',
    noHeader: true,
    loader: async () => {
      const { LearningPathDetailPage } = await import('./LearningPathsPage');
      return <LearningPathDetailPage />;
    },
  },
});

const breakGlassPage = PageBlueprint.make({
  name: 'break-glass',
  params: {
    path: '/break-glass',
    routeRef: breakGlassRouteRef,
    title: 'Break Glass',
    icon: <ShieldIcon />,
    noHeader: true,
    loader: async () => {
      const { BreakGlassPage } = await import('./BreakGlassPage');
      return <BreakGlassPage />;
    },
  },
});

export const atlasPagesPlugin = createFrontendPlugin({
  pluginId: 'atlas-pages',
  routes: {
    myGroups: myGroupsRouteRef,
    catalogV2: catalogV2RouteRef,
    learningPaths: learningPathsRouteRef,
    breakGlass: breakGlassRouteRef,
  },
  extensions: [
    myGroupsPage,
    catalogV2Page,
    learningPathsPage,
    learningPathDetailPage,
    breakGlassPage,
  ],
});
