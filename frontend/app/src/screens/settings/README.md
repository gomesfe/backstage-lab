# Configurações — `/settings`

Preferências e identidade do usuário. Substitui a página do plugin
user-settings.

**Arquivos:** `SettingsPage.tsx`. Registro em `modules/pages/overridesModule.tsx`.

## Deve conter

Três abas:

1. **Aparência** — um cartão por tema instalado (Atlas escuro, Atlas claro),
   cada um com **amostra das cores do próprio tema**, nome e descrição; o
   ativo marcado. Trocar aplica na hora.
2. **Identidade**
   - topo com **avatar de iniciais**, nome, e-mail (ou ref) e botão **Sair**;
   - linhas: usuário (a ref que o RBAC usa), nome de exibição, grupos,
     versão do portal.
3. **Feature flags** — um interruptor por flag registrada; se nenhum plugin
   registrou flags, diz isso.

## Fontes de dados

`appThemeApi`, `identityApi`, `featureFlagsApi` e `atlasEnvApi` — o que a
tela mostra é o estado real da sessão.
