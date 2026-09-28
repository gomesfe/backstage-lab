# Administração — `/admin`

Visão de quem administra o portal: credenciais emitidas em todo o portal e
uso. Separada de API Keys de propósito — ver as próprias chaves e ver as de
todo mundo são permissões diferentes.

**Arquivos:** `AdminPage.tsx`. Registro em `plugins/admin/src/plugin.tsx`.

## Deve conter

1. **Cabeçalho:** "Administração" · badge "acesso admin".
2. **Três números:** Usuários com chaves · Chaves ativas · **Sem uso há 30
   dias** (ativas e paradas, em amarelo se > 0 — candidatas a revogação).
3. **Painel com abas**
   - **Usuários com chaves:** usuário, chaves ativas, total emitido, último
     uso (comparado por data, não por texto).
   - **Uso do portal** e **Uso da API:** o lab não tem log de auditoria. As
     abas dizem isso e o que faltaria, em vez de mostrar números inventados.

## Fontes de dados

A lista de API keys (`apiKeysApi.list`), agregada por dono.
