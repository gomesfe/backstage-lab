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

**Toda tela é React** (TypeScript, MUI v4, `makeStyles` com os tokens do
Atlas), no padrão do repositório do Atlas. São duas partes:

```
atlas/screens/home/            components/home/
├── README.md  o que a tela    ├── HomePage.tsx   a página: guarda o estado
│              deve conter     ├── WelcomeCard.tsx, …  pedaços que só desenham
└── page.tsx   rota, título,   ├── hooks/         de onde vêm os dados
               ícone           ├── helpers.ts     regras puras (filtros, contas)
                               ├── types.ts · data.ts (quando há exemplo)
                               └── styles.ts      makeStyles da tela
```

- **`screens/<tela>/page.tsx`** registra a rota e carrega a página de
  `components/<tela>/` sob demanda.
- **`components/shared/`** tem o que todas usam: `useAtlasStyles` (cabeçalho,
  números, abas, cartão, tabela em faixas, cápsulas, selos, diálogos),
  `FilterSelect` (campo de filtro com busca, no estilo react-select),
  `ColumnFilter` (funil por coluna), `SeloAmbiente`, `SeloCiclo`, ambientes e
  paginação. Cada tela soma os estilos próprios em `styles.ts`.
- **Dados:** o hook de cada tela é o único ponto de troca. As que já têm
  fonte usam as APIs do Backstage (`catalogApi`, `identityApi`,
  `notificationsApi`, `searchApi`, `storageApi`) ou os backends do lab
  (`api-keys`, `atlas-agent`); as outras leem um `data.ts` de exemplo.
- **`screens/index.ts`** junta os `page.tsx`. **Tela nova:** crie
  `components/<tela>/` no mesmo formato, um `page.tsx` em `screens/<tela>/`
  e acrescente aqui.
- **`../shell/`** — a moldura do portal: barra (e menu Toolkit), tema,
  login, selo de ambiente, preferências e traduções.
- **Visual** — tokens em `../components/tokens.ts`; a barra ainda usa as
  classes de `../assets/atlas.css`, gerado do repositório
  [atlas-design-system](https://github.com/gomesfe/atlas-design-system) com
  `yarn ds:sync`.

**As telas conversam entre si** pelo endereço: `?filtro=valor` e `#aba`
chegam aplicados. Exemplos: um grupo leva ao Catálogo com `?owner=`; um nome
leva a `/entidade#component-payments-api`; um recurso do Mapa leva a
Aprovações com `?q=<recurso>&status=all#approver`; a Home leva ao Mapa com
`?service=PAG#repositorios`.

## Regras que valem para todas as telas

1. **Cabeçalho** com sobretítulo, título e subtítulo, exceto a Home.
2. **Ação que não existe não finge que gravou.** Sem backend, a tela diz o
   que aconteceria (ex.: Break Glass) ou muda só a sessão (Aprovações).
3. **Vazio tratado:** toda lista diz por que está vazia.
4. **Link é link** (`Link` do Backstage ou `<a>`), nunca clique em `div`.
5. **Um botão principal (verde) por área.** Ações destrutivas pedem
   confirmação.
6. **Tabelas** em faixas, com funil por coluna e sem rolagem lateral num
   notebook (1366px).
