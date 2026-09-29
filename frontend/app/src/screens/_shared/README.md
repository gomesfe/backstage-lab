# _shared — peças usadas por mais de uma tela

## `EntityTablePage.tsx`

A tabela de entidades do catálogo. É a base de **Catálogo**, **APIs** e
**Docs** — no redesign eram a mesma tela com um filtro de tipo diferente, e
uma implementação só evita que filtros e colunas divirjam entre elas.

O que ela oferece (cada tela escolhe via props):

| Prop | Para quê |
|---|---|
| `kinds` | quais tipos de entidade listar; com mais de um, aparece o filtro "Tipo" e a coluna "Tipo" |
| `requireTechdocs` | só entidades com `backstage.io/techdocs-ref` (Docs) |
| `openIn` | `entity` (página da entidade) ou `docs` (leitor do TechDocs) |

Comportamento comum:

- Busca por nome, descrição e tag; filtros de Tipo, Dono e Tag; "★ Favoritos".
- **Filtros na URL:** `?q=`, `?kind=`, `?owner=`, `?tag=`, `?fav=1`. A Home e
  Meus grupos mandam para cá já filtrado.
- **Favoritos reais** pela API de entidades favoritas do Backstage — salvos
  por usuário, os mesmos da estrela na página da entidade. Favoritos
  aparecem primeiro.
- Nome da entidade é link; paginação de 20 em 20; "Limpar filtros" quando
  algum está ativo.
- Esqueleto ao carregar; vazio distingue "catálogo vazio" de "nada com esses
  filtros".
