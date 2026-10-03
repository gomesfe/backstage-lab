# Configurações — `/settings`

Preferências e identidade do usuário. Substitui a página do plugin
user-settings.

**Arquivos:** a tela do portal é React, em `components/settings/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota.


## Deve conter

Três abas:

1. **Aparência**
   - um cartão por tema instalado (Atlas escuro, Atlas claro), com **amostra
     das cores**, nome e descrição; o ativo marcado. Trocar aplica na hora;
   - **Posição do menu:** no topo (padrão) ou na lateral. Abaixo de 900px o
     menu volta para o topo. Preferência `nav` no navegador;
   - **Ícones no menu:** interruptor (ligado por padrão) que mostra ou tira o
     ícone de cada tela nas pílulas do menu e no menu lateral. Preferência
     `navIcons` (`1`/`0`). O menu mostra no máximo 7 pílulas; o resto fica
     atrás da seta, e em tela menor cabem menos;

2. **Identidade**
   - topo com **avatar de iniciais**, nome, e-mail (ou ref) e botão **Sair**;
   - linhas: usuário (a ref que o RBAC usa), nome de exibição, grupos,
     versão do portal.
3. **Feature flags** — um interruptor por flag registrada; se nenhum plugin
   registrou flags, diz isso.

## Fontes de dados

`appThemeApi`, `identityApi`, `featureFlagsApi` e `atlasEnvApi` — o que a
tela mostra é o estado real da sessão.
