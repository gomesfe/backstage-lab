# Create — `/create`

A galeria de templates: provisionar recursos AWS, criar repositórios,
registrar entidades. Só o **índice** é nosso; tudo abaixo de `/create/…`
(formulário do template, execução da tarefa, editor) continua sendo o do
scaffolder.

**Arquivos:** `CreatePage.tsx`. Registro em `modules/pages/overridesModule.tsx`.

## Deve conter

1. **Cabeçalho:** "Provisionamento" · Create · ações **Minhas tarefas**
   (`/create/tasks`) e, discreto, **Registrar componente existente**
   (`/catalog-import`, a tela oficial de importar `catalog-info.yaml`).
   Esse botão só aparece para quem tem `catalog.entity.create` no RBAC e
   fora de produção (local, dev, lab) — pouca gente usa, e ele é para
   catalogar, não para provisionar.
2. **Busca** e **pílulas de categoria com contagem** — "Todas (18)",
   "Banco de dados (5)"…
3. **Grupos por categoria**, cada um com título e contador, e a grade de
   cartões. Cada cartão: badge de tipo, título, descrição (até 3 linhas),
   até 3 tags e **Choose** (link para o formulário do template).

## Estados

- Esqueleto ao carregar.
- Nenhum template registrado → lembra de rodar `yarn templates:sync`.
- Filtro sem resultado → mensagem própria.

## Fontes de dados

- Entidades `kind: Template` do catálogo.
- Categoria: anotação `atlas.nuclea.com.br/categoria`; sem ela, "Outros".

## Não faz

- Não reimplementa o wizard: o formulário é dirigido por JSON Schema, com
  campos customizados e execução de tarefa — refazê-lo seria refazer o
  plugin inteiro.
