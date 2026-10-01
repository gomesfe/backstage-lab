# Configurações — `/settings`

Preferências e identidade do usuário. Substitui a página do plugin
user-settings.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter

Três abas:

1. **Aparência**
   - um cartão por tema instalado (Atlas escuro, Atlas claro), com **amostra
     das cores**, nome e descrição; o ativo marcado. Trocar aplica na hora;
   - **Posição do menu:** no topo (padrão) ou na lateral. Abaixo de 900px o
     menu volta para o topo. Preferência `nav` no navegador;
   - **Área interna do Atlas:** interruptor que mostra, numa aba à parte do
     Catálogo e do Mapa, o catálogo e os recursos que o time do Atlas usa.
     Desligado (padrão), a aba não aparece. Preferência `internal`.
2. **Identidade**
   - topo com **avatar de iniciais**, nome, e-mail (ou ref) e botão **Sair**;
   - linhas: usuário (a ref que o RBAC usa), nome de exibição, grupos,
     versão do portal.
3. **Feature flags** — um interruptor por flag registrada; se nenhum plugin
   registrou flags, diz isso.

## Fontes de dados

`appThemeApi`, `identityApi`, `featureFlagsApi` e `atlasEnvApi` — o que a
tela mostra é o estado real da sessão.
