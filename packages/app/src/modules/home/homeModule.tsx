import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import HomeIcon from '@material-ui/icons/Home';
import homePlugin from '@backstage/plugin-home/alpha';

/**
 * Substitui a Home do plugin `home` pela do Atlas.
 *
 * O módulo é registrado com `pluginId: 'home'` e a extensão sem nome, o que
 * produz o id `page:home` — o mesmo da página original. Ids iguais fazem esta
 * vencer, então a navegação e as rotas continuam apontando para o lugar certo.
 */
const homePage = PageBlueprint.make({
  params: {
    path: '/',
    title: 'Home',
    icon: <HomeIcon />,
    // Sem routeRef a página funciona, mas some da navegação: o item de nav só
    // é criado para páginas que expõem uma. Reaproveitamos a do plugin `home`
    // para que links existentes para a home continuem resolvendo.
    routeRef: homePlugin.routes.root,
    noHeader: true,
    loader: async () => {
      const { AtlasHomePage } = await import('./AtlasHomePage');
      return <AtlasHomePage />;
    },
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'home',
  extensions: [homePage],
});
