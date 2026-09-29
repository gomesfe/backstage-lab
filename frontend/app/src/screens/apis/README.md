# APIs — `/api-docs`

As APIs publicadas no portal. Substitui o índice do plugin `api-docs`; a
página de cada API (com a especificação renderizada) continua sendo a
oficial.

**Arquivos:** `ApisPage.tsx` (configuração), tabela em
`../_shared/EntityTablePage.tsx`. Registro em
`modules/pages/overridesModule.tsx`.

## Deve conter

1. **Cabeçalho:** "Explorer" · APIs.
2. **Filtros:** busca, ★ Favoritos, Dono, Tag (sem filtro de tipo: é um só).
3. **Tabela:** Nome (link), Descrição, Tipo (openapi, grpc, asyncapi…), Dono,
   Ciclo de vida, Tags, Ações.
4. **Paginação.**

## Estados

- Vazio → orienta a declarar `kind: API` no `catalog-info.yaml`.
