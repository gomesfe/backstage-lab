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
      // Tela em React (components/entity), no padrão do repositório do
      // Atlas. O index.html desta pasta fica como referência visual avulsa.
      const { EntityPage } = await import('../../../components/entity');
      return <EntityPage />;
    },
  },
});
