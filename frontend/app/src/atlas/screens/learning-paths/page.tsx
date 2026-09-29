import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import SchoolIcon from '@material-ui/icons/School';

/**
 * Registro das Trilhas: a lista e o detalhe de uma trilha. Entram no plugin
 * `atlas-pages` em `screens/index.ts`.
 *
 * As trilhas são uma tela HTML só; cada trilha é uma seção com âncora. O
 * endereço antigo de detalhe (/learning-paths/<id>) leva à seção dela.
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
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="learning-paths" />;
    },
  },
});

export const detailPage = PageBlueprint.make({
  name: 'learning-path-detail',
  params: {
    path: '/learning-paths/:pathId',
    noHeader: true,
    loader: async () => {
      const { LearningPathRedirect } = await import('./LearningPathRedirect');
      return <LearningPathRedirect />;
    },
  },
});
