import { createFrontendModule, PageBlueprint } from '@backstage/frontend-plugin-api';
import HomeIcon from '@material-ui/icons/Home';
import homePlugin from '@backstage/plugin-home/alpha';

/**
 * Registro da Home. Substitui a do plugin `home`: registrada com
 * `pluginId: 'home'` e extensão sem nome, produz o id `page:home` — o mesmo
 * da página original. Ids iguais fazem esta vencer, então a navegação e as
 * rotas continuam apontando para o lugar certo.
 */
export const page = PageBlueprint.make({
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
      // Tela em React (components/home), no padrão do repositório do
      // Atlas. O index.html desta pasta fica como referência visual avulsa.
      const { HomePage } = await import('../../../components/home');
      return <HomePage />;
    },
  },
});

export const pageModule = createFrontendModule({
  pluginId: 'home',
  extensions: [page],
});
