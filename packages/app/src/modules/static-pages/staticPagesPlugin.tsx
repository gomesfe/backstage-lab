import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import DashboardIcon from '@material-ui/icons/Dashboard';
import DescriptionIcon from '@material-ui/icons/Description';
import ExtensionIcon from '@material-ui/icons/Extension';
import GroupIcon from '@material-ui/icons/People';
import LibraryIcon from '@material-ui/icons/LibraryBooks';
import { staticPages } from './generated';

const ICONS: Record<string, JSX.Element> = {
  dashboard: <DashboardIcon />,
  docs: <DescriptionIcon />,
  extension: <ExtensionIcon />,
  group: <GroupIcon />,
  library: <LibraryIcon />,
};

/**
 * Uma extensão de página por pasta em static-pages/.
 *
 * Nada aqui é escrito à mão por tela — `yarn pages:sync` regenera
 * ./generated.ts e este módulo se ajusta sozinho.
 */
// O item de sidebar só é criado para páginas que expõem um routeRef.
const routeRefs = Object.fromEntries(
  staticPages.map(page => [page.slug, createRouteRef()]),
);

const pageExtensions = staticPages.map(page =>
  PageBlueprint.make({
    name: page.slug,
    params: {
      path: page.path,
      routeRef: routeRefs[page.slug],
      // title + icon são o que coloca o item na sidebar
      ...(page.nav
        ? { title: page.title, icon: ICONS[page.icon] ?? ICONS.dashboard }
        : {}),
      // o frame desenha o próprio header, com subtítulo e dono
      noHeader: true,
      loader: async () => {
        const { StaticPageFrame } = await import('./StaticPageFrame');
        return <StaticPageFrame page={page} />;
      },
    },
  }),
);

export const staticPagesPlugin = createFrontendPlugin({
  pluginId: 'static-pages',
  routes: routeRefs,
  extensions: pageExtensions,
});
