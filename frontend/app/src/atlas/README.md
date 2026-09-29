# Atlas — pasta para copiar e colar

Tudo o que o front do Atlas precisa está aqui: as telas, os componentes, a
barra de navegação, o tema e o CSS. Nada nesta pasta importa arquivo de fora
dela — só pacotes do npm.

```
atlas/
├── index.ts        ponto de entrada: `atlasFeatures` + importa o CSS
├── assets/         atlas.css (design system) e bui-tokens.css
├── components/     componentes compartilhados (AtlasPage, Badge, Tabs, logo…)
├── shell/          moldura do portal: barra (nav), tema, login, ambiente, traduções
└── screens/        uma pasta por tela, cada uma com tudo dela
    ├── index.ts        junta o page.tsx de todas as telas
    ├── _shared/        o que mais de uma tela usa
    └── home/           README.md, page.tsx (rota), HomePage.tsx, dados…
```

## Levar para outro app Backstage

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

3. Garanta estes pacotes no `package.json` do app (versões em
   `frontend/app/package.json` deste repositório):

   `@backstage/catalog-model`, `@backstage/config`,
   `@backstage/core-components`, `@backstage/core-plugin-api`,
   `@backstage/errors`, `@backstage/frontend-plugin-api`,
   `@backstage/plugin-api-docs`, `@backstage/plugin-app-react`,
   `@backstage/plugin-catalog`, `@backstage/plugin-catalog-common`,
   `@backstage/plugin-catalog-react`, `@backstage/plugin-home`,
   `@backstage/plugin-notifications`, `@backstage/plugin-notifications-common`,
   `@backstage/plugin-permission-common`, `@backstage/plugin-permission-react`,
   `@backstage/plugin-scaffolder`, `@backstage/plugin-search`,
   `@backstage/plugin-search-react`, `@backstage/plugin-techdocs`,
   `@backstage/theme`, `@backstage/ui`, `@material-ui/core`,
   `@material-ui/icons`, `react-router-dom`, `react-use`.

4. `yarn install` e `yarn start`.

O CSS entra sozinho pelo `atlas/index.ts` — não precisa importar nada no
`index.tsx`.

## O que as telas esperam do backend

Catálogo, scaffolder, busca, notificações e permissões são os plugins padrão do
Backstage. Três telas pedem backends próprios deste repositório:

| Tela | Rota do backend |
|---|---|
| API Keys, Administração | `/api/api-keys` (`backend/api-keys`) |
| Agente | `/api/atlas-agent` (`backend/atlas-agent`) |

Sem eles, essas telas abrem e mostram o erro; as outras funcionam normalmente.

## Onde mexer

- **Uma tela:** `screens/<tela>/` — o README dela diz o que deve conter.
- **Tela nova:** copie uma pasta de `screens/`, ajuste o `page.tsx` e
  acrescente em `screens/index.ts`.
- **Ordem da barra:** `shell/nav/AtlasTopNav.tsx` (`PILL_ORDER`).
- **Visual:** `assets/atlas.css` é gerado do repositório
  [atlas-design-system](https://github.com/gomesfe/atlas-design-system) com
  `yarn ds:sync`. Padrão visual novo entra no design system primeiro.
