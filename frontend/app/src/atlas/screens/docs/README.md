# Docs — `/docs`

O índice da documentação técnica (TechDocs). Lista só o que publica
documentação.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

1. **Cabeçalho:** "TechDocs" · Docs.
2. **Filtros:** busca, ★ Favoritos, Tipo, Dono, Tag.
3. **Tabela** de componentes, sistemas e APIs **com** a anotação
   `backstage.io/techdocs-ref`. O nome abre **direto o leitor do TechDocs**
   (`/docs/<ns>/<kind>/<nome>`), não a página da entidade — quem está em
   Docs quer ler.

## Estados

- Vazio → explica que falta a anotação `backstage.io/techdocs-ref`.
