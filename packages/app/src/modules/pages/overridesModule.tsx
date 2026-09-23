import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import CatalogIcon from '@material-ui/icons/MenuBook';
import ApiIcon from '@material-ui/icons/Extension';
import DocsIcon from '@material-ui/icons/Description';
import SearchIcon from '@material-ui/icons/Search';
import SettingsIcon from '@material-ui/icons/Settings';
import CreateIcon from '@material-ui/icons/AddCircleOutline';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';

/**
 * Substitui as páginas de **índice** dos plugins oficiais pelas do redesign.
 *
 * Cada módulo usa o `pluginId` do plugin original e uma extensão sem nome, o
 * que reproduz o id da página (`page:catalog`, `page:search`, …). Id igual
 * faz a nossa vencer.
 *
 * Só o índice. As páginas internas — entidade do catálogo, wizard do
 * scaffolder, leitor de TechDocs — continuam sendo as oficiais: elas são o
 * motor, não a aparência, e refazê-las seria reimplementar os plugins.
 *
 * Cada página reaproveita o `routeRef` do plugin original, para que links
 * internos e `RouteRef` de outros plugins continuem resolvendo.
 */

const catalogPage = PageBlueprint.make({
  params: {
    path: '/catalog',
    routeRef: catalogPlugin.routes.catalogIndex,
    title: 'Catalog',
    icon: <CatalogIcon />,
    noHeader: true,
    loader: async () => {
      const { EntityTablePage } = await import('./EntityTablePage');
      return (
        <EntityTablePage
          eyebrow="Descoberta"
          title="Catálogo"
          subtitle="Componentes, sistemas e recursos registrados no portal."
          kinds={['Component', 'System', 'Resource']}
          emptyMessage="Nenhuma entidade registrada. Use um template em Create."
        />
      );
    },
  },
});

const catalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [catalogPage],
});

const apisPage = PageBlueprint.make({
  params: {
    path: '/api-docs',
    routeRef: apiDocsPlugin.routes.root,
    title: 'APIs',
    icon: <ApiIcon />,
    noHeader: true,
    loader: async () => {
      const { EntityTablePage } = await import('./EntityTablePage');
      return (
        <EntityTablePage
          eyebrow="Explorer"
          title="APIs"
          subtitle="Explore, versione e consuma as APIs publicadas no portal."
          kinds={['API']}
          emptyMessage="Nenhuma API registrada."
        />
      );
    },
  },
});

const apiDocsModule = createFrontendModule({
  pluginId: 'api-docs',
  extensions: [apisPage],
});

const docsPage = PageBlueprint.make({
  params: {
    path: '/docs',
    routeRef: techdocsPlugin.routes.root,
    title: 'Docs',
    icon: <DocsIcon />,
    noHeader: true,
    loader: async () => {
      const { EntityTablePage } = await import('./EntityTablePage');
      return (
        <EntityTablePage
          eyebrow="TechDocs"
          title="Docs"
          subtitle="Documentação técnica versionada junto ao código dos componentes."
          kinds={['Component', 'System', 'API']}
          requireTechdocs
          emptyMessage="Nenhum componente publica TechDocs. Falta a anotação backstage.io/techdocs-ref."
        />
      );
    },
  },
});

const techdocsModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [docsPage],
});

const searchPage = PageBlueprint.make({
  params: {
    path: '/search',
    routeRef: searchPlugin.routes.root,
    title: 'Buscar',
    icon: <SearchIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasSearchPage } = await import('./SearchPage');
      return <AtlasSearchPage />;
    },
  },
});

const searchModule = createFrontendModule({
  pluginId: 'search',
  extensions: [searchPage],
});

const createPage = PageBlueprint.make({
  params: {
    path: '/create',
    routeRef: scaffolderPlugin.routes.root,
    title: 'Create',
    icon: <CreateIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasCreatePage } = await import('./CreatePage');
      return <AtlasCreatePage />;
    },
  },
});

const scaffolderModule = createFrontendModule({
  pluginId: 'scaffolder',
  extensions: [createPage],
});

const settingsPage = PageBlueprint.make({
  params: {
    path: '/settings',
    title: 'Configurações',
    icon: <SettingsIcon />,
    noHeader: true,
    loader: async () => {
      const { AtlasSettingsPage } = await import('./SettingsPage');
      return <AtlasSettingsPage />;
    },
  },
});

const settingsModule = createFrontendModule({
  pluginId: 'user-settings',
  extensions: [settingsPage],
});

export const pageOverrides = [
  catalogModule,
  apiDocsModule,
  techdocsModule,
  searchModule,
  scaffolderModule,
  settingsModule,
];
