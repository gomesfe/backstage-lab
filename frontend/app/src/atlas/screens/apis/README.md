# APIs — `/api-docs`

As APIs publicadas no portal. Substitui o índice do plugin `api-docs`; a
página de cada API (com a especificação renderizada) continua sendo a
oficial.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

1. **Cabeçalho:** "Explorer" · APIs.
2. **Filtros:** busca, ★ Favoritos, Dono, Tag (sem filtro de tipo: é um só).
3. **Tabela:** Nome (link), Descrição, Tipo (openapi, grpc, asyncapi…), Dono,
   Ciclo de vida, Tags, Ações.
4. **Paginação.**

## Estados

- Vazio → orienta a declarar `kind: API` no `catalog-info.yaml`.
