# Atlas — as telas em HTML estático, numa pasta só

Todas as telas do Atlas são **HTML estático**, uma pasta por tela, com o CSS
e o script que elas precisam. A mesma pasta serve de dois jeitos:

- **Avulsa:** abra `screens/home/index.html` no navegador (duplo clique
  basta) ou publique a pasta em qualquer servidor. Barra, Toolkit, tema,
  busca, filtros e diálogos funcionam sem Backstage.
- **No Backstage:** as mesmas telas viram as rotas do portal (`/`,
  `/catalog`, `/approvals`…), com a barra do portal em volta.

```
atlas/
├── assets/
│   ├── atlas.css        design system (gerado do atlas-design-system)
│   ├── atlas-html.css   complementos das telas HTML
│   ├── atlas.js         barra, Toolkit, tema e interação — só na versão avulsa
│   └── brand/           logos oficiais (claro e escuro)
├── screens/             uma pasta por tela
│   ├── home/            README.md · index.html · page.tsx
│   ├── catalog/  approvals/  …
│   ├── index.ts         junta os page.tsx (para o Backstage)
│   └── html.generated.ts  o <main> de cada index.html, gerado pelo sync
├── shell/               moldura do portal: barra, tema, login, ambiente,
│                        traduções e html/ (mostra as telas no portal)
├── components/          logo, selo de ambiente e tokens usados pelo shell
└── index.ts             entrada para o Backstage: `atlasFeatures` + CSS
```

## Só as telas (sem Backstage)

Copie `assets/` e `screens/` mantendo os dois lado a lado — as telas
referenciam `../../assets/`. Os `page.tsx`, `index.ts` e
`html.generated.ts` você pode ignorar.

Cada `index.html` é um documento completo. O conteúdo da tela fica dentro
de `<main data-atlas-screen>`; a barra é desenhada pelo `atlas.js` no
`<header data-atlas-nav>`. Links entre telas: `../<tela>/index.html`.

## Dentro de um app Backstage

Vale para app no **novo sistema de frontend** (`@backstage/frontend-defaults`).

1. Copie a pasta `atlas/` inteira para `packages/app/src/atlas/`.
2. No `App.tsx`:

   ```tsx
   import { createApp } from '@backstage/frontend-defaults';
   import { atlasFeatures } from './atlas';

   export default createApp({
     features: [...atlasFeatures],
   });
   ```

3. Garanta no `package.json` do app os pacotes que o `shell/` usa (versões
   em `frontend/app/package.json` deste repositório): `@backstage/config`,
   `@backstage/core-components`, `@backstage/core-plugin-api`,
   `@backstage/frontend-plugin-api`, `@backstage/plugin-app-react`,
   `@backstage/plugin-catalog`, `@backstage/plugin-home`,
   `@backstage/plugin-notifications`, `@backstage/plugin-scaffolder`,
   `@backstage/plugin-api-docs`, `@backstage/plugin-techdocs`,
   `@backstage/plugin-search`, `@backstage/theme`, `@backstage/ui`,
   `@material-ui/core`, `@material-ui/icons`, `react-router-dom`,
   `react-use`.
4. Copie também `scripts/sync-atlas-html.mjs` e rode-o sempre que editar um
   `index.html` (neste repositório: `yarn screens:sync`; `yarn
   screens:check` falha se o gerado estiver velho).

O CSS entra sozinho pelo `atlas/index.ts`.

## Editar uma tela

1. Abra `screens/<tela>/index.html` no navegador e edite o arquivo.
2. Use só classes do design system (`atlas-*`). Interação é por atributo
   `data-atlas-*` (tabela em `screens/README.md`) — **sem `<script>` dentro
   do `<main>`**, senão o sync reprova.
3. `yarn screens:sync` para o portal pegar a mudança.

Os dados são de exemplo, escritos no HTML. Onde a tela precisaria de dado
real (catálogo, aprovações, chaves), o README dela diz de onde viria.

## O que continua sendo do Backstage

- A barra do portal (`shell/nav`) e o menu Toolkit dela
  (`screens/home/toolkit.tsx`). A versão avulsa tem a mesma barra em
  `assets/atlas.js` — mudou a lista de telas ou do Toolkit, mude nos dois.
- As páginas internas dos plugins: página de uma entidade, leitor do
  TechDocs, formulário e tarefas das ofertas (scaffolder).
- Login, tema e selo de ambiente.
