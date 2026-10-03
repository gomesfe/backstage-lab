import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import SchoolIcon from '@material-ui/icons/School';

/**
 * Registro das Trilhas: a lista e o detalhe de uma trilha. Entram no plugin
 * `atlas-pages` em `screens/index.ts`.
 *
 * Telas em React, em components/learningPaths.
 *
 * O detalhe não ganha routeRef de propósito — é uma sub-rota, e um item de
 * navegação para "detalhe de trilha" sem trilha escolhida não tem para onde
 * apontar.
 */
export const learningPathsRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'learning-paths',
  params: {
    path: '/learning-paths',
    routeRef: learningPathsRouteRef,
    title: 'Trilhas',
    icon: <SchoolIcon />,
    noHeader: true,
    loader: async () => {
      const { LearningPathsPage } = await import(
        '../../../components/learningPaths'
      );
      return <LearningPathsPage />;
    },
  },
});

export const detailPage = PageBlueprint.make({
  name: 'learning-path-detail',
  params: {
    path: '/learning-paths/:pathId',
    noHeader: true,
    loader: async () => {
      const { LearningPathDetailPage } = await import(
        '../../../components/learningPaths'
      );
      return <LearningPathDetailPage />;
    },
  },
});
