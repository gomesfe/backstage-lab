# Catálogo — `/catalog`

Lista, em tabela, tudo o que está registrado: aplicações, sistemas, recursos
e squads. É o índice do portal — substitui a página de índice do plugin de
catálogo; a página de cada entidade continua sendo a oficial.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

1. **Cabeçalho:** "Descoberta" · Catálogo · o que a lista contém.
2. **Filtros:** busca, ★ Favoritos, Limpar filtros; Tipo (Aplicação,
   Sistema, Recurso, Squad), Dono, Tag.
3. **Tabela:** Nome (link para a entidade), Descrição, Tipo, Subtipo, Dono,
   Ciclo de vida (badge), Tags (até 3 + contador), Ações (favoritar, abrir).
4. **Paginação** com o total de itens.

## Estados

- Esqueleto ao carregar.
- Catálogo vazio → orienta a usar um template em Create.
- Filtro sem resultado → "Nada encontrado com esses filtros".

## Entradas pela URL

`?kind=Component|System|Resource|Group`, `?owner=<grupo>`, `?tag=`, `?q=`,
`?fav=1`. Links da Home e de Meus grupos usam isso.

## Aba "Interno do Atlas"

Duas abas no topo: **Catálogo** e **Interno do Atlas**. A segunda só aparece
quando a pessoa liga "Área interna do Atlas" em Configurações › Aparência e
guarda as aplicações e os recursos que o próprio time do Atlas usa (portal,
agente, RBAC, banco, fila, logs), separados do catálogo dos squads.
