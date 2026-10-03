# Trilhas — `/learning-paths` e `/learning-paths/:id`

Trilhas guiadas para aprender o Atlas e as práticas da casa, com o progresso
de cada pessoa.

**Arquivos:** a tela do portal é React, em `components/learningPaths/` (lista em `/learning-paths`, detalhe em `/learning-paths/<id>`; o endereço antigo `/learning-paths#<id>` leva ao detalhe). `index.html` fica como referência visual avulsa e `page.tsx` registra as rotas.

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Lista — deve conter

1. **Cabeçalho:** "Aprendizado" · Trilhas de aprendizado.
2. **Filtros:** busca (título, descrição e temas), Dificuldade, Tema.
3. **Um cartão por trilha:** badge de dificuldade, título, descrição,
   **barra de progresso** ("2 de 4"), chips de etapas e temas, e o botão
   **Começar / Continuar / Revisar** conforme o progresso.

## Detalhe — deve conter

1. **Cabeçalho** com dificuldade, título, descrição; ações **Recomeçar** (só
   se houver progresso) e **Todas as trilhas**.
2. **Barra de progresso.**
3. **Etapas numeradas**, cada uma com título, resumo e "Ler". A próxima a
   fazer fica destacada; as feitas ficam riscadas.
4. **Clicar numa etapa abre um pop-up** com o texto completo (seções com
   título, parágrafos e listas — ex.: "Onboard no Atlas", "Cadastro e
   acesso", "Pré-requisitos", "Configurações de DevTeam"). No rodapé:
   **Marcar como concluída / Desmarcar** e **Concluir e seguir** (ou
   **Concluir trilha** na última).
5. Ao concluir tudo, aviso de trilha concluída com atalho para outras.
6. Trilha inexistente → "Trilha não encontrada" com link para a lista.

## Trilhas atuais

- **Primeiros passos** — Cadastro e acesso ao Atlas · Canais de comunicação
  do Teams · Solicitação de VDI Linux. **Texto provisório**: genérico de
  propósito, sem nomes de canal, links ou contatos. Troque pelo oficial em
  `components/learningPaths/data.ts` (`PRIMEIROS_PASSOS`, campo `conteudo`).
- Onboarding de desenvolvedor · Provisionamento com o scaffolder ·
  Permissões, chaves e break glass (só com resumo; sem `content`, o pop-up
  mostra o resumo).

## Fontes de dados

- **Conteúdo:** `components/learningPaths/data.ts`. Quando houver um serviço de trilhas, é o
  único arquivo a trocar.
- **Progresso:** `storageApi` do Backstage, por usuário. Hoje grava no
  navegador; com o backend de user-settings passa a seguir o usuário entre
  dispositivos, sem mudar a tela.

## Não faz

- Não marca etapas como feitas no conteúdo. O redesign fazia isso — todo
  mundo via o mesmo progresso falso.
