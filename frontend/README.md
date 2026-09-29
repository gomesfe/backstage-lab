# Frontend

Tudo o que o navegador roda: as telas do Atlas, o visual e as telas estáticas.
**Nada aqui importa código do backend** — os dois lados só conversam por HTTP.

```
frontend/
├── app/             o portal (React + Backstage)
│   ├── src/atlas/       TUDO do front do Atlas numa pasta só, pronta para
│   │                    copiar para outro app: telas, componentes, barra,
│   │                    tema e CSS — veja app/src/atlas/README.md
│   ├── src/modules/     só o que é deste repositório (telas estáticas)
│   └── public/brand/    logos oficiais (horizontal, vertical, símbolo; claro e escuro)
└── static-pages/    telas em HTML/CSS puro que viram rotas do portal
```

O visual em si (o CSS) **não é editado aqui**: vem do repositório
[atlas-design-system](https://github.com/gomesfe/atlas-design-system) e chega
em `app/src/atlas/assets/atlas.css` por `yarn ds:sync`.

## O que precisa do backend

O front não guarda dado próprio. Cada tela pede ao backend, sempre com o login
de quem está usando:

| O front usa | Backend que responde | Telas |
|---|---|---|
| `catalogApi` | `catalog` | Home, Catálogo, APIs, Docs, Meus grupos, Ofertas |
| `scaffolderApi` (formulário e tarefas das ofertas) | `scaffolder` | Ofertas |
| `searchApi` | `search` | Buscar |
| `notificationsApi` | `notifications` | Notificações, sino da barra |
| `/api/api-keys` | `backend/api-keys` | API Keys, Administração |
| `/api/atlas-agent` | `backend/atlas-agent` | Agente |
| `usePermission` | `permission` + `backend/rbac` | quem vê Aprovações, Refresh admin, "Registrar componente existente" |
| login (`identityApi`, GitHub/guest) | `auth` | todas |

Configuração lida pelo front: `atlas.env` e `atlas.version` (selo do ambiente
na barra), do `app-config.yaml` da raiz.

**Telas com dado de exemplo** (sem backend por trás ainda): Aprovações, Mapa de
provisionamento e Atlas × Jira. Cada uma tem um único arquivo `*Data.ts` para
trocar pela API real.

## Rodar

Da raiz do repositório:

```bash
yarn start          # backend + front, na ordem certa
yarn start:app      # só o front (precisa do backend já rodando em :7007)
```

## Passar o front para outras telas

Três níveis, do mais leve ao mais completo:

1. **Só o visual, em HTML puro** — pegue o `index.html` do
   [atlas-design-system](https://github.com/gomesfe/atlas-design-system): CSS
   embutido, componentes documentados e o construtor "Monte sua tela", que
   gera a página pronta. Não precisa de backend nem de build.
2. **Tela nova dentro do portal, sem escrever React** — solte uma pasta em
   `static-pages/` (veja [static-pages/README.md](static-pages/README.md)).
   `yarn pages:new <slug> "Título"` cria o esqueleto.
3. **Tela nova dentro do portal, em React** — copie uma pasta de
   `app/src/atlas/screens/` (ela já traz o `page.tsx` com a rota), acrescente
   em `app/src/atlas/screens/index.ts` e descreva no README da pasta o que a
   tela deve conter.
4. **O front inteiro em outro app Backstage** — copie `app/src/atlas/` e siga
   [app/src/atlas/README.md](app/src/atlas/README.md).

Regras que valem para as telas: [app/src/atlas/screens/README.md](app/src/atlas/screens/README.md).
