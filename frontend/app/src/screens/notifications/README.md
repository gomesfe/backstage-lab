# Notificações — `/notifications`

A caixa de entrada do portal: tarefas do Create que terminaram, aprovações,
comunicados. Substitui a página do plugin de notificações do Backstage.
Abre pelo **sino** da barra, que mostra quantas não lidas existem.

**Arquivos:** `NotificationsPage.tsx`, `useUnreadCount.ts` (contador do
sino). Registro em `modules/pages/overridesModule.tsx`.

## Deve conter

1. **Cabeçalho:** "Caixa de entrada" · Notificações · ação **Marcar todas
   como lidas** (só quando há não lidas).
2. **Abas:** **Não lidas (N)** · **Todas** · **Salvas**, e busca no título ou
   na descrição.
3. **Filtros:** **Severidade mínima** (Crítica, Alta, Normal, Baixa) e
   **Tópico** (os tópicos que existem nas notificações do usuário).
4. **Lista agrupada por dia:** Hoje · Ontem · Esta semana · Mais antigas.
   Cada notificação:
   - faixa e ícone da cor da severidade;
   - título em negrito e ponto verde enquanto não lida; o título é link
     quando a notificação aponta para algum lugar (rota do portal abre na
     mesma aba, URL externa em nova aba) — abrir marca como lida;
   - descrição em até 2 linhas;
   - quando ("há 5 min", "ontem às 14:05"), tópico e origem;
   - ações: abrir, marcar como lida/não lida, salvar/remover das salvas.
5. **"Carregar mais"** de 30 em 30, com "N de total".

## Estados

- Carregando → esqueleto de 4 itens.
- Sem não lidas → "Tudo em dia".
- Salvas vazia → explica como salvar.
- Filtro sem resultado → mensagem própria.
- Erro da API → painel de erro.

## Contador do sino

`useUnreadCount` relê o total de não lidas a cada minuto, ao voltar para a
aba do navegador e sempre que esta tela muda algo. Se a API falhar, o sino
fica sem número — não acusa notificação por erro de rede.

## Fonte de dados

**Real:** plugin de notificações do Backstage (o backend já roda no lab).
Quem envia são os plugins do backend — o scaffolder, por exemplo, pela
action `notification:send`.
