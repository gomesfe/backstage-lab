# Ofertas — `/create`

A galeria de **ofertas** — é assim que o Atlas chama os templates do
scaffolder: provisionar recursos AWS, criar repositórios, registrar
entidades. O endereço continua `/create`, para links antigos não quebrarem. Só o **índice** é nosso; tudo abaixo de `/create/…`
(formulário do template, execução da tarefa, editor) continua sendo o do
scaffolder.

**Arquivos:** `CreatePage.tsx`. Registro da rota em `page.tsx`.

## Deve conter

1. **Cabeçalho:** "Provisionamento" · Ofertas · ações **Minhas tarefas**
   (`/create/tasks`) e, discreto, **Registrar componente existente**
   (`/catalog-import`, a tela oficial de importar `catalog-info.yaml`).
   Esse botão só aparece para quem tem `catalog.entity.create` no RBAC e
   fora de produção (local, dev, lab) — pouca gente usa, e ele é para
   catalogar, não para provisionar.
2. **Busca** e **pílulas de categoria com contagem** — "Todas (18)",
   "Banco de dados (5)"…
3. **Grupos por categoria**, cada um com título e contador, e a grade de
   cartões. Cada cartão: badge de tipo, título, descrição (até 3 linhas),
   até 3 tags e **Choose** (link para o formulário da oferta).

## Estados

- Esqueleto ao carregar.
- Nenhum template registrado → lembra de rodar `yarn templates:sync`.
- Filtro sem resultado → mensagem própria.

## Fontes de dados

- Entidades `kind: Template` do catálogo.
- Categoria: anotação `atlas.nuclea.com.br/categoria`; sem ela, "Outros".

## Não faz

- Não reimplementa o formulário da oferta: o formulário é dirigido por JSON Schema, com
  campos customizados e execução de tarefa — refazê-lo seria refazer o
  plugin inteiro.

## Vocabulário: template → oferta

Na interface é sempre **oferta**. As telas internas do scaffolder (formulário,
execução, lista de tarefas) são do Backstage; os textos delas são trocados
por tradução, em `shell/translations/translationsModule.tsx` — "Nova
oferta", "Execução de …", "Tarefas das ofertas". No código e no catálogo o
tipo continua `Template`.
