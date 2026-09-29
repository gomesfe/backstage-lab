# Aprovações — `/approvals`

Minhas aprovações e minhas solicitações **numa tela só**. É a mesma tabela:
o que muda é de que lado do pedido você está.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

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
   Todas abrem um modal com o resumo antes de confirmar.
7. **Detalhes** — pop-up largo, pensado para pedidos de deleção:
   - **Cabeçalho:** nome do recurso, "Deleção · ambiente X", a oferta e se o
     recurso foi **excluído** ou não.
   - **Situação em destaque**, colorida pelo estado, com a barra de aprovações.
   - Cards **Recurso** (nome, tipo, grupo dono, dono, ambiente) e
     **Solicitação** (solicitante, time, data e "aberta há X", calculado por
     `data-atlas-ago` em `atlas-behaviors.js`).
   - **Grupos aprovadores** (admin, DevOps…), cada um com aprovou/pendente.
   - **Andamento** completo: solicitação criada, aprovação necessária,
     automática, concedida, concluída, deleção iniciada, workflow disparado e
     concluído, remoção do catálogo iniciada, recurso removido, deleção
     concluída. Rejeitada, cancelada e falha terminam ali com o motivo.
   - **Rodapé:** Fechar, mais Aprovar/Rejeitar (pendente) ou Cancelar.

Status: aguardando aprovação · em execução · concluído · rejeitado ·
cancelado · falhou. "Histórico" é tudo o que já terminou.

## Fonte de dados

**Exemplo** — o lab não tem o serviço de aprovações, e a tela diz isso num
aviso no topo. Aprovar/rejeitar/cancelar muda só a sessão. Para ligar no
serviço real, troque `loadApprovals` em `approvalsData.ts` e faça as ações
chamarem a API.
