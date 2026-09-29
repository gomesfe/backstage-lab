# Aprovações — `/approvals`

Minhas aprovações e minhas solicitações **numa tela só**. É a mesma tabela:
o que muda é de que lado do pedido você está.

**Arquivos:** `ApprovalsPage.tsx`, `approvalsData.ts` (fonte de dados).
Registro em `modules/pages/pagesPlugin.tsx`.

## Quem vê o quê

- Com a permissão **`atlas.approvals.review`** (role `aprovador` no
  `rbac-policy.csv`): aparece o seletor **Minhas aprovações / Minhas
  solicitações**, abrindo em aprovações — é a lista que mais gente usa no dia
  a dia. O seletor mostra quantas aprovações estão pendentes.
- Sem a permissão: não há seletor; a tela é só **Minhas solicitações**.

## Deve conter

1. **Cabeçalho:** "Governança" · Aprovações.
2. **Três números**, que também filtram a tabela ao clicar:
   **Aguardando aprovação** · **Em execução** · **Concluídos**.
3. **Barra de busca:** seletor aprovações/solicitações e o campo
   "Buscar por recurso ou solicitante".
4. **Filtros:** abas **Pendentes · Em execução · Histórico · Todos** (com
   contagem), **Ambiente** (dev, perf, int, ext, prod, prdnv) e **Grupo**.
5. **Tabela:** Recurso (com o template embaixo), Ambiente, Grupo, Dono,
   Solicitante, Data da solicitação, Aprovações ("1 de 2"; passar o mouse
   mostra quem aprovou), Status, Ações. Paginação de 10.
6. **Ações**
   - Em aprovações, pendente e ainda não aprovado por você: **Aprovar**
     (principal) e **Rejeitar** (exige motivo).
   - Em solicitações, pendente: **Cancelar** (motivo opcional).
   - Sempre: **Detalhes**.
   Todas abrem um modal com o resumo antes de confirmar. Em prod/prdnv o
   modal de aprovação avisa que o provisionamento começa depois da última
   aprovação.

Status: aguardando aprovação · em execução · concluído · rejeitado ·
cancelado · falhou. "Histórico" é tudo o que já terminou.

## Fonte de dados

**Exemplo** — o lab não tem o serviço de aprovações, e a tela diz isso num
aviso no topo. Aprovar/rejeitar/cancelar muda só a sessão. Para ligar no
serviço real, troque `loadApprovals` em `approvalsData.ts` e faça as ações
chamarem a API.
