# Atlas × Jira — `/atlas-jira`

A ponte entre as issues do GitHub e o Jira. Issues abertas a partir do
Atlas (em repositórios de templates e do portal) chegam aqui como
**rascunho**; quem cuida da fila decide o que vira card no Jira.

**Arquivos:** a tela do portal é React, em `components/atlasJira/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota; `index.html` fica como referência visual avulsa (abre direto no navegador).


## Deve conter

1. **Cabeçalho:** "Integrações" · Atlas × Jira · ação **Sincronizar com
   GitHub** (importa as issues de novo; rascunho que já virou card não volta).
2. **Menu lateral** com contagem: **Rascunhos** e **Cards abertos**.
3. **Busca** e filtro de **Tipo** (Bug, Melhoria, Tarefa, Dúvida).
4. **Rascunhos** — tabela: Origem (`repositório#número`), Solicitante da
   execução, Título (abre a issue completa), Tipo, Data de importação, Ação:
   **Criar card** (principal) e **Descartar**.
5. **Cards abertos** — tabela: Card (chave do Jira), Título, Tipo, Status
   (A fazer, Em andamento, Em revisão), Responsável, Origem, Criado em,
   Detalhes.

Criar card e descartar pedem confirmação. O card nasce em "A fazer", sem
responsável, apontando para a issue de origem.

## Fonte de dados

**Exemplo** — o lab não tem a integração com GitHub nem com Jira; a tela
avisa isso no topo. Para ligar no real, troque `loadJira` e `syncFromGitHub`
em `jiraData.ts` e faça "Criar card" chamar a API do Jira.
