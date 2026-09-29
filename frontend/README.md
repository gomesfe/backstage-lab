# Frontend

Tudo o que o navegador roda: as telas do Atlas, o visual e as telas estáticas.
**Nada aqui importa código do backend** — os dois lados só conversam por HTTP.

```
frontend/
├── app/             o portal (React + Backstage)
│   ├── src/atlas/       TUDO do front do Atlas numa pasta só: as telas em
│   │                    HTML estático (abrem sozinhas ou dentro do portal),
│   │                    CSS, barra e tema — veja app/src/atlas/README.md
│   ├── src/modules/     só o que é deste repositório (telas estáticas)
│   └── public/brand/    logos oficiais (horizontal, vertical, símbolo; claro e escuro)
└── static-pages/    telas em HTML/CSS puro que viram rotas do portal
```

O visual em si (o CSS) **não é editado aqui**: vem do repositório
[atlas-design-system](https://github.com/gomesfe/atlas-design-system) e chega
em `app/src/atlas/assets/atlas.css` por `yarn ds:sync`.

## Dados

As telas do Atlas são HTML estático com **dados de exemplo** escritos no
próprio `index.html` de cada uma. O que continua falando com o backend é a
moldura do portal: login (`auth`), o contador do sino (`notifications`), o
selo de ambiente (`atlas.env` e `atlas.version` do `app-config.yaml`) e as
páginas internas dos plugins — entidade do catálogo, leitor do TechDocs e o
formulário e as tarefas das ofertas (`scaffolder`).

## Rodar

Da raiz do repositório:

```bash
yarn start          # backend + front, na ordem certa
yarn screens:sync   # depois de editar um index.html de tela
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
3. **Tela nova do Atlas** — copie uma pasta de `app/src/atlas/screens/`
   (`index.html` + `page.tsx`), edite o HTML, ajuste a rota, acrescente em
   `app/src/atlas/screens/index.ts` e rode `yarn screens:sync`.
4. **O front inteiro em outro app Backstage** — copie `app/src/atlas/` e siga
   [app/src/atlas/README.md](app/src/atlas/README.md).

Regras que valem para as telas: [app/src/atlas/screens/README.md](app/src/atlas/screens/README.md).
