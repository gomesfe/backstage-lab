# Atlas — telas, barra, tema e CSS numa pasta só

O front do Atlas para um app Backstage (novo sistema de frontend): as telas,
a moldura do portal (barra, tema, login, ambiente) e o CSS da barra.

```
atlas/
├── assets/
│   ├── atlas.css        design system (gerado do atlas-design-system; a barra usa)
│   ├── bui-tokens.css   tokens do Atlas por cima da Backstage UI
│   └── brand/           logos oficiais (claro e escuro)
├── screens/             uma pasta por tela: README.md (o que deve conter) e
│   │                    page.tsx (rota, título, ícone)
│   └── index.ts         junta os page.tsx
├── shell/               moldura do portal: barra e Toolkit, tema, login,
│                        ambiente, preferências e traduções
├── components/          logo, selo de ambiente e tokens
├── permissions.ts       permissões do Atlas (área interna, aprovador…)
└── index.ts             entrada para o Backstage: `atlasFeatures` + CSS
```

O código das telas fica em `../components/<tela>/` (React + TypeScript +
MUI v4 + `makeStyles`), com a base comum em `../components/shared/`.
Detalhes em [screens/README.md](screens/README.md).

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

3. Garanta no `package.json` do app os pacotes que o `shell/` e as telas usam (versões
   em `frontend/app/package.json` deste repositório): `@backstage/config`,
   `@backstage/core-components`, `@backstage/core-plugin-api`,
   `@backstage/frontend-plugin-api`, `@backstage/plugin-app-react`,
   `@backstage/plugin-catalog`, `@backstage/plugin-home`,
   `@backstage/plugin-notifications`, `@backstage/plugin-scaffolder`,
   `@backstage/plugin-api-docs`, `@backstage/plugin-techdocs`,
   `@backstage/plugin-search`, `@backstage/plugin-search-react`,
   `@backstage/plugin-catalog-react`, `@backstage/plugin-catalog-common`,
   `@backstage/catalog-model`, `@backstage/plugin-permission-react`,
   `@backstage/plugin-notifications-common`, `@backstage/errors`,
   `@backstage/theme`, `@backstage/ui`,
   `@material-ui/core`, `@material-ui/icons`, `react-router-dom`,
   `react-use`.
4. Copie também `components/` (as telas) para `packages/app/src/components/`.

O CSS entra sozinho pelo `atlas/index.ts`.

## Editar uma tela

1. Leia o `screens/<tela>/README.md` — ele diz o que a tela deve conter.
2. Edite `../components/<tela>/`: estado na página, desenho nos componentes,
   dados no hook (`hooks/`), regras em `helpers.ts`, visual em `styles.ts`.
3. `yarn tsc` e `yarn backstage-cli package lint` antes do commit.

## O que continua sendo do Backstage

- As páginas internas dos plugins: leitor do TechDocs, formulário e tarefas
  das ofertas (scaffolder), importação de componente.
- Login, tema e selo de ambiente.
