# Telas do portal

Cada tela mora na própria pasta, com o código dela e um `README.md` que diz
**o que a tela deve conter**. Antes de mexer numa tela, leia o README dela;
se a mudança altera o que ela contém, atualize o README no mesmo PR.

Na barra de navegação, nesta ordem:

| Tela | Rota | Pasta |
|---|---|---|
| Home | `/` | [home](home/README.md) |
| Catálogo | `/catalog` | [catalog](catalog/README.md) |
| Meus grupos | `/my-groups` | [my-groups](my-groups/README.md) |
| Aprovações | `/approvals` | [approvals](approvals/README.md) |
| APIs | `/api-docs` | [apis](apis/README.md) |
| Docs | `/docs` | [docs](docs/README.md) |
| Trilhas | `/learning-paths`, `/learning-paths/:id` | [learning-paths](learning-paths/README.md) |
| Ofertas | `/create` | [create](create/README.md) |
| Mapa de provisionamento | `/provisioning-map` | [provisioning-map](provisioning-map/README.md) |
| Break Glass | `/break-glass` | [break-glass](break-glass/README.md) |
| Atlas × Jira | `/atlas-jira` | [atlas-jira](atlas-jira/README.md) |
| Agente | `/agent` | [agent](agent/README.md) |
| API Keys | `/api-keys` | [api-keys](api-keys/README.md) |
| Administração | `/admin` | [admin](admin/README.md) |

Fora da barra, pelos botões do canto direito:

| Tela | Rota | Pasta |
|---|---|---|
| Buscar | `/search` | [search](search/README.md) |
| Notificações | `/notifications` | [notifications](notifications/README.md) |
| Configurações | `/settings` | [settings](settings/README.md) |

Sem pílula, aberta pelos nomes de serviços, APIs, sistemas, recursos e squads:

| Tela | Rota | Pasta |
|---|---|---|
| Entidade | `/entidade#<tipo>-<nome>` | [entity](entity/README.md) |

A ordem e a lista da barra ficam em `shell/nav/AtlasTopNav.tsx`
(`PILL_ORDER`). Página registrada que não está lá continua acessível pela
URL, mas não ganha pílula.

## Onde cada coisa mora

**Toda tela é um HTML estático.** Cada pasta tem:

```
screens/home/
├── README.md    o que a tela deve conter
├── index.html   a tela — documento completo, abre direto no navegador
└── page.tsx     registro no portal: rota, título, ícone
```

O mesmo `index.html` vale para os dois lugares:

- **Avulso** (duplo clique, ou qualquer servidor): carrega
  `../../assets/atlas.css` e `../../assets/atlas.js`, que desenha a barra, o
  menu Toolkit, o tema claro/escuro e liga busca, filtros, abas e diálogos.
  Links entre telas são `../<tela>/index.html`.
- **No portal Backstage**: `yarn screens:sync` pega só o `<main
  data-atlas-screen>` de cada tela, troca os links `../<tela>/index.html`
  pelas rotas do portal (`/catalog`…) e grava `html.generated.ts`. O
  `shell/html/AtlasHtmlScreen.tsx` mostra esse HTML na rota da tela, com a
  barra do portal em volta. Nada de `<script>` dentro do `<main>`: o
  sync reprova (mesmo contrato de `frontend/static-pages`).

Interação sem JavaScript na tela, por atributo. A lógica é uma só,
`../assets/atlas-behaviors.js`, usada pela versão avulsa e pelo portal; a
documentação completa está no topo desse arquivo. Nada grava dado: a tela
reage ao clique para mostrar o visual.

| Atributo | Faz |
|---|---|
| `data-atlas-search="lista"` | busca por texto nas linhas `data-atlas-row` de `#lista` |
| `data-atlas-filter="lista"` + `data-atlas-filter-key="type"` | num `<select>` ou num grupo de botões `data-atlas-value` (abas, pílulas): mostra só as linhas com `data-type` igual |
| `data-atlas-empty-for="lista"` | aparece quando nada sobra |
| `data-atlas-reset="lista"` | "Limpar filtros" |
| `data-atlas-tabs` + `data-atlas-tab` / `data-atlas-panel` | abas; `#id` no endereço abre a aba `id` |
| `data-atlas-open="id"` / `data-atlas-close` | abre / fecha um `<dialog class="atlas-dialog" id="id">` |
| `data-atlas-toggle` | liga/desliga (estrela, lida, salvar, copiar, "Filtros"); `.atlas-whenOn` / `.atlas-whenOff` trocam o conteúdo |
| `data-atlas-set-theme` / `data-atlas-signout` | tema e sair (no portal, usam o Backstage) |
| `data-portal-href="/rota"` | num `<a>`: link que só existe no portal (ex.: formulário de uma oferta) |

**As telas conversam entre si.** Todo link interno é `../<tela>/index.html`,
com `?filtro=valor` e `#aba` quando faz sentido — o destino chega filtrado
ou na aba certa, avulso ou no portal. Exemplos: um grupo leva ao Catálogo com
`?owner=pagamentos`; um nome de serviço leva a `../entity/index.html#component-payments-api`;
um recurso do Mapa leva a Aprovações com `?q=<recurso>&status=all#approver`.

- **`screens/index.ts`** — junta os `page.tsx` de todas as telas.
  **Tela nova:** copie uma pasta, edite o `index.html`, ajuste rota e nome
  no `page.tsx`, acrescente aqui e rode `yarn screens:sync`.
- **`../shell/`** — a moldura do portal: barra, tema, login, selo de
  ambiente, traduções e o `html/` que mostra as telas.
- **Visual** — só classes do design system (`atlas-*`), de
  `../assets/atlas.css`, gerado do repositório
  [atlas-design-system](https://github.com/gomesfe/atlas-design-system) com
  `yarn ds:sync`. `../assets/atlas-html.css` tem só os complementos das
  telas HTML (diálogo, `[hidden]`, logo da barra avulsa).

## Regras que valem para todas as telas

1. **Cabeçalho** com sobretítulo, título e subtítulo (`atlas-pageHeader`),
   exceto a Home, que abre direto no conteúdo.
2. **Exemplo avisado.** Os dados são de exemplo, escritos no HTML. Telas que
   imitam uma ação (aprovar, criar chave, pedir acesso) avisam no topo que
   nada é gravado.
3. **Vazio tratado:** toda lista filtrável tem um `data-atlas-empty-for`
   que explica que nada casou com o filtro.
4. **Link é link.** Navegação é `<a href>`, nunca `onclick` em `div`/`span`
   — abre em nova aba, funciona no teclado e no leitor de tela.
5. **Um botão principal (verde) por área.** Ações destrutivas pedem
   confirmação (diálogo).
6. **Sem `<script>` e sem `on*=` dentro do `<main>`.** Interação só pelos
   atributos `data-atlas-*`; é o que deixa a mesma tela rodar avulsa e no
   portal.
