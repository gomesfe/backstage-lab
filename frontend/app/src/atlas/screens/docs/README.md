# Docs — `/docs`

O índice da documentação técnica (TechDocs). Lista só o que publica
documentação.

**Arquivos:** a tela do portal é React, em `components/docs/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota.


## Deve conter

1. **Cabeçalho:** "TechDocs" · Docs.
2. **Filtros:** busca, ★ Favoritos, Tipo, Dono, Tag.
3. **Tabela** de componentes, sistemas e APIs **com** a anotação
   `backstage.io/techdocs-ref`. O nome abre **direto o leitor do TechDocs**
   (`/docs/<ns>/<kind>/<nome>`), não a página da entidade — quem está em
   Docs quer ler.

## Estados

- Vazio → explica que falta a anotação `backstage.io/techdocs-ref`.
