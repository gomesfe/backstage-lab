# API Keys — `/api-keys`

Chaves de API para integrações e automações. Tela de quem desenvolve: cada
um vê e gerencia as próprias chaves.

**Arquivos:** a tela do portal é React, em `components/apiKeys/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota; `index.html` fica como referência visual avulsa (abre direto no navegador).


## Deve conter

1. **Cabeçalho:** "Credenciais" · API Keys · ação principal **Nova chave**.
2. **Três números:** Ativas · Expiram em 7 dias (em amarelo se > 0) ·
   Revogadas ou expiradas.
3. **Abas** Ativas (N) / Todas (N).
4. **Tabela:** Nome, Chave (só o prefixo), Status (badge; "expira em breve"
   quando faltam menos de 7 dias), Dono, Criada em, Expira em, Último uso,
   Ações.
5. **Revogar** pede confirmação na própria linha ("Revogar? Sim, revogar /
   Cancelar") — é irreversível.

## Modal "Nova API key" (design system, não MUI)

- Campo **Para que serve** (obrigatório; Enter cria) e **Expira em**
  (7/30/90 dias, 1 ano, sem expiração; padrão 30 dias).
- Depois de criada: aviso "Copie agora", o segredo em destaque com botão
  **Copiar**, e "Já copiei" para fechar. O segredo não aparece de novo.
- Esc e clique fora fecham; o foco fica preso no modal enquanto aberto.

## Não faz

- Não guarda nem mostra o segredo depois de fechado: o backend só tem o hash.
