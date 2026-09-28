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
| Create | `/create` | [create](create/README.md) |
| Mapa de provisionamento | `/provisioning-map` | [provisioning-map](provisioning-map/README.md) |
| Break Glass | `/break-glass` | [break-glass](break-glass/README.md) |
| Atlas × Jira | `/atlas-jira` | [atlas-jira](atlas-jira/README.md) |
| API Keys | `/api-keys` | [plugins/admin/…/api-keys](../../../../plugins/admin/src/screens/api-keys/README.md) |
| Administração | `/admin` | [plugins/admin/…/admin](../../../../plugins/admin/src/screens/admin/README.md) |

Fora da barra, pelos botões do canto direito:

| Tela | Rota | Pasta |
|---|---|---|
| Buscar | `/search` | [search](search/README.md) |
| Notificações | `/notifications` | [notifications](notifications/README.md) |
| Configurações | `/settings` | [settings](settings/README.md) |

A ordem e a lista da barra ficam em `modules/nav/AtlasTopNav.tsx`
(`PILL_ORDER`). Página registrada que não está lá continua acessível pela
URL, mas não ganha pílula.

`_shared/` guarda o que mais de uma tela usa: a tabela de entidades
(Catálogo, APIs, Docs), a lista de ambientes e as permissões do Atlas.

## Onde cada coisa mora

- **`screens/<tela>/`** — a interface: componentes, dados da tela, README.
- **`modules/`** — o registro no Backstage: rota, `routeRef`, item de
  navegação. Um módulo só aponta para a tela (`loader`), sem lógica de UI.
- **Visual** — só classes do design system (`atlas-*`), vindas de
  `modules/theme/atlas.css`, que é gerado do repositório
  [atlas-design-system](https://github.com/gomesfe/atlas-design-system) com
  `yarn ds:sync`. Precisou de um padrão visual novo? Ele entra no design
  system primeiro, e depois vem para cá.

## Regras que valem para todas as telas

1. **Cabeçalho** com sobretítulo, título e subtítulo (`AtlasPage`), exceto a
   Home, que abre direto no conteúdo.
2. **Dado real, ou exemplo avisado.** Número, lista e status vêm do catálogo
   ou de uma API. Onde o lab não tem a fonte (Aprovações, Mapa de
   provisionamento, Atlas × Jira), a tela usa dados de exemplo **com um
   aviso no topo**, e a fonte fica num único arquivo `*Data.ts` para trocar.
3. **Três estados sempre tratados:** carregando (esqueleto do DS, não
   spinner), vazio (explica o que fazer) e erro.
4. **Link é link.** Navegação usa `RouterLink`, não `onClick` em `div`/`span`
   — abre em nova aba, funciona no teclado e no leitor de tela.
5. **Filtros na URL** (`?q=`, `?kind=`…) quando a tela tem filtro: o link
   filtrado pode ser compartilhado e o "voltar" funciona.
6. **Um botão principal (verde) por área.** Ações destrutivas pedem
   confirmação.
7. **Controle restrito some para quem não pode** — pela permissão no RBAC
   (`usePermission`), nunca por lista de nomes no código.
8. **Voltar só onde faz sentido.** Não há voltar/avançar global. Tela de
   detalhe (ex.: uma trilha) passa `parents` ao `AtlasPage` — isso mostra a
   trilha "Home › Trilhas › …" — e tem um "Voltar para …" explícito. Telas
   principais não têm nenhum dos dois: já estão na barra de navegação.
