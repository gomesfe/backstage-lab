import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import GroupsIcon from '@material-ui/icons/Group';
import ApprovalIcon from '@material-ui/icons/AssignmentTurnedIn';
import MapIcon from '@material-ui/icons/Map';
import JiraIcon from '@material-ui/icons/CallSplit';
import AgentIcon from '@material-ui/icons/Forum';
import SchoolIcon from '@material-ui/icons/School';
import ShieldIcon from '@material-ui/icons/LockOpen';

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
export const approvalsRouteRef = createRouteRef();
export const provisioningMapRouteRef = createRouteRef();
export const atlasJiraRouteRef = createRouteRef();
export const agentRouteRef = createRouteRef();
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
      const { MyGroupsPage } = await import('../../screens/my-groups/MyGroupsPage');
      return <MyGroupsPage />;
    },
  },
});

const approvalsPage = PageBlueprint.make({
  name: 'approvals',
  params: {
    path: '/approvals',
    routeRef: approvalsRouteRef,
    title: 'Aprovações',
    icon: <ApprovalIcon />,
    noHeader: true,
    loader: async () => {
      const { ApprovalsPage } = await import('../../screens/approvals/ApprovalsPage');
      return <ApprovalsPage />;
    },
  },
});

const provisioningMapPage = PageBlueprint.make({
  name: 'provisioning-map',
  params: {
    path: '/provisioning-map',
    routeRef: provisioningMapRouteRef,
    title: 'Mapa de provisionamento',
    icon: <MapIcon />,
    noHeader: true,
    loader: async () => {
      const { ProvisioningMapPage } = await import('../../screens/provisioning-map/ProvisioningMapPage');
      return <ProvisioningMapPage />;
    },
  },
});

const atlasJiraPage = PageBlueprint.make({
  name: 'atlas-jira',
  params: {
    path: '/atlas-jira',
    routeRef: atlasJiraRouteRef,
    title: 'Atlas × Jira',
    icon: <JiraIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasJiraPage } = await import('../../screens/atlas-jira/AtlasJiraPage');
      return <AtlasJiraPage />;
    },
  },
});

const agentPage = PageBlueprint.make({
  name: 'agent',
  params: {
    path: '/agent',
    routeRef: agentRouteRef,
    title: 'Agente',
    icon: <AgentIcon />,
    noHeader: true,
    loader: async () => {
      const { AgentPage } = await import('../../screens/agent/AgentPage');
      return <AgentPage />;
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
      const { LearningPathsPage } = await import('../../screens/learning-paths/LearningPathsPage');
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
      const { LearningPathDetailPage } = await import('../../screens/learning-paths/LearningPathsPage');
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
      const { BreakGlassPage } = await import('../../screens/break-glass/BreakGlassPage');
      return <BreakGlassPage />;
    },
  },
});

export const atlasPagesPlugin = createFrontendPlugin({
  pluginId: 'atlas-pages',
  routes: {
    myGroups: myGroupsRouteRef,
    approvals: approvalsRouteRef,
    provisioningMap: provisioningMapRouteRef,
    atlasJira: atlasJiraRouteRef,
    agent: agentRouteRef,
    learningPaths: learningPathsRouteRef,
    breakGlass: breakGlassRouteRef,
  },
  extensions: [
    myGroupsPage,
    approvalsPage,
    provisioningMapPage,
    atlasJiraPage,
    agentPage,
    learningPathsPage,
    learningPathDetailPage,
    breakGlassPage,
  ],
});
