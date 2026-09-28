# Trilhas — `/learning-paths` e `/learning-paths/:id`

Trilhas guiadas para aprender o Atlas e as práticas da casa, com o progresso
de cada pessoa.

**Arquivos:** `LearningPathsPage.tsx` (lista e detalhe), `learningData.ts`
(conteúdo), `useProgress.ts` (progresso). Registro em
`modules/pages/pagesPlugin.tsx`.

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
3. **Etapas marcáveis**, numeradas. A próxima a fazer fica destacada; as
   feitas ficam riscadas. Clicar marca/desmarca.
4. Ao concluir tudo, aviso de trilha concluída com atalho para outras.
5. Trilha inexistente → "Trilha não encontrada" com link para a lista.

## Fontes de dados

- **Conteúdo:** `learningData.ts`. Quando houver um serviço de trilhas, é o
  único arquivo a trocar.
- **Progresso:** `storageApi` do Backstage, por usuário. Hoje grava no
  navegador; com o backend de user-settings passa a seguir o usuário entre
  dispositivos, sem mudar a tela.

## Não faz

- Não marca etapas como feitas no conteúdo. O redesign fazia isso — todo
  mundo via o mesmo progresso falso.
