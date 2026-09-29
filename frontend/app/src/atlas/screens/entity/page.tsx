import { createRouteRef, PageBlueprint } from '@backstage/frontend-plugin-api';

/**
 * Registro da tela de entidade. Entra no plugin `atlas-pages` em
 * `screens/index.ts`. Não tem pílula na barra: chega-se a ela pelos nomes em
 * Catálogo, APIs, Docs, Home, Meus grupos e Buscar (`/entidade#<tipo>-<nome>`).
 */
export const entityRouteRef = createRouteRef();

export const page = PageBlueprint.make({
  name: 'entity',
  params: {
    path: '/entidade',
    routeRef: entityRouteRef,
    noHeader: true,
    loader: async () => {
      const { AtlasHtmlScreen } = await import('../../shell/html/AtlasHtmlScreen');
      return <AtlasHtmlScreen slug="entity" />;
    },
  },
});
