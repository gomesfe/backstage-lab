# Catálogo V2 — `/catalog-v2`

O mesmo catálogo em cartões, para quem prefere navegar visualmente. Mesma
fonte de dados do Catálogo — é outra forma de ver, não um catálogo paralelo.

**Arquivos:** `CatalogV2Page.tsx`. Registro em `modules/pages/pagesPlugin.tsx`.

## Deve conter

1. **Cabeçalho** com atalho "Ver em tabela" (vai para `/catalog`).
2. **Pílulas de tipo com contagem:** Todos, Aplicações, Recursos, APIs,
   Sistemas — ex.: "APIs (4)". Busca ao lado.
3. **Grade de cartões**, em ordem alfabética. Cada cartão:
   - badges de tipo e de ciclo de vida;
   - título e descrição (até 3 linhas);
   - rodapé com subtipo e dono como chips, e "Abrir" (link para a entidade).

## Estados

- Esqueleto: seis cartões fantasmas.
- Catálogo vazio ≠ filtro sem resultado — mensagens diferentes.

## Entradas pela URL

`?kind=`, `?q=`.
