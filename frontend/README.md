# Frontend

Tudo o que o navegador roda: as telas do Atlas, o visual e as telas estáticas.
**Nada aqui importa código do backend** — os dois lados só conversam por HTTP.

```
frontend/
├── app/             o portal (React + Backstage)
│   ├── src/atlas/       moldura do Atlas: rotas das telas, barra, tema, login,
│   │                    CSS — veja app/src/atlas/README.md
│   ├── src/components/  as telas do Atlas em React (uma pasta por tela) e a
│   │                    base comum em shared/
│   ├── src/modules/     só o que é deste repositório (telas estáticas)
│   └── public/brand/    logos oficiais (horizontal, vertical, símbolo; claro e escuro)
└── static-pages/    telas em HTML/CSS puro que viram rotas do portal
```

O visual em si (o CSS) **não é editado aqui**: vem do repositório
[atlas-design-system](https://github.com/gomesfe/atlas-design-system) e chega
em `app/src/atlas/assets/atlas.css` por `yarn ds:sync`.

## Dados

Cada tela lê os dados por um hook (`components/<tela>/hooks/`). Catálogo,
APIs, Docs, Entidade, Home, Ofertas, Meus grupos, Busca, Notificações e
Configurações usam as APIs do Backstage; API Keys, Administração e Agente, os
backends do lab. Mapa, Aprovações, Skills, Status e Atlas × Jira ainda leem
um `data.ts` de exemplo — o hook é o único ponto a trocar quando a fonte
existir.

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
3. **Tela nova do Atlas** — crie `app/src/components/<tela>/` no formato das
   outras (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`), um
   `page.tsx` em `app/src/atlas/screens/<tela>/` e acrescente em
   `app/src/atlas/screens/index.ts`.
4. **O front inteiro em outro app Backstage** — copie `app/src/atlas/` e siga
   [app/src/atlas/README.md](app/src/atlas/README.md).

Regras que valem para as telas: [app/src/atlas/screens/README.md](app/src/atlas/screens/README.md).
