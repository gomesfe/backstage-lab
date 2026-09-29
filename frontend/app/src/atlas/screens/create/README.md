# Ofertas — `/create`

A galeria de **ofertas** — é assim que o Atlas chama os templates do
scaffolder: provisionar recursos AWS, criar repositórios, registrar
entidades. O endereço continua `/create`, para links antigos não quebrarem. Só o **índice** é nosso; tudo abaixo de `/create/…`
(formulário do template, execução da tarefa, editor) continua sendo o do
scaffolder.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `CreatePage.tsx` mostra o `index.html` em `/create` e deixa as sub-rotas (formulário de cada oferta, tarefas) com o scaffolder do Backstage, que é quem executa a oferta.

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

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
