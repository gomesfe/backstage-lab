# Telas do portal

Cada tela mora na própria pasta, com o código dela e um `README.md` que diz
**o que a tela deve conter**. Antes de mexer numa tela, leia o README dela;
se a mudança altera o que ela contém, atualize o README no mesmo PR.

| Tela | Rota | Pasta |
|---|---|---|
| Home | `/` | [home](home/README.md) |
| Catálogo | `/catalog` | [catalog](catalog/README.md) |
| Catálogo V2 | `/catalog-v2` | [catalog-v2](catalog-v2/README.md) |
| Meus grupos | `/my-groups` | [my-groups](my-groups/README.md) |
| APIs | `/api-docs` | [apis](apis/README.md) |
| Docs | `/docs` | [docs](docs/README.md) |
| Trilhas | `/learning-paths`, `/learning-paths/:id` | [learning-paths](learning-paths/README.md) |
| Create | `/create` | [create](create/README.md) |
| Break Glass | `/break-glass` | [break-glass](break-glass/README.md) |
| Buscar | `/search` | [search](search/README.md) |
| Configurações | `/settings` | [settings](settings/README.md) |
| API Keys | `/api-keys` | [plugins/admin/…/api-keys](../../../../plugins/admin/src/screens/api-keys/README.md) |
| Administração | `/admin` | [plugins/admin/…/admin](../../../../plugins/admin/src/screens/admin/README.md) |

`_shared/` guarda o que mais de uma tela usa — hoje, a tabela de entidades
que Catálogo, APIs e Docs compartilham.

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
2. **Dado real ou nada.** Número, lista e status vêm do catálogo ou de uma
   API. Onde o lab não tem a fonte, a tela diz isso em vez de inventar.
3. **Três estados sempre tratados:** carregando (esqueleto do DS, não
   spinner), vazio (explica o que fazer) e erro.
4. **Link é link.** Navegação usa `RouterLink`, não `onClick` em `div`/`span`
   — abre em nova aba, funciona no teclado e no leitor de tela.
5. **Filtros na URL** (`?q=`, `?kind=`…) quando a tela tem filtro: o link
   filtrado pode ser compartilhado e o "voltar" funciona.
6. **Um botão principal (verde) por área.** Ações destrutivas pedem
   confirmação.
