# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

1. **Hero com degradê verde** (`atlas-welcomeCard atlas-heroBig`), em duas partes:
   - **Boas-vindas:** saudação dinâmica ("Bom dia, {nome}"; o guest vê
     "Bem-vindo ao Atlas") e a caixa **Perguntar**, que leva ao Agente com o
     texto (`?q=`).
   - **Seu time** (cartão à direita): lista para **trocar de time** (Todos,
     Plataforma, Pagamentos, Onboarding, Antifraude, Bitrago), com o champion
     (nome e e-mail) e o link para Meus grupos. A escolha fica guardada no
     navegador (`atlas.team`, padrão `plataforma`) e vale para o resto da tela.
2. **Por onde começar** — quatro atalhos com ícone, nome e uma linha:
   Provisionar recurso, Mapa de provisionamento, Aprovações e Catálogo.
3. **"{Time} em números"** — Aplicações, APIs, Recursos provisionados e
   Repositórios do time escolhido. Cada cartão abre a tela certa já filtrada
   (`/provisioning-map?service=PAG`, `…#repositorios`, `/catalog?owner=pagamentos`).
   Os números e links mudam por `data-atlas-by-pref="team"` (`data-v-<time>`,
   `data-h-<time>`); com dado real viriam de um endpoint de contagem, com
   `atlas-skeleton` até chegar.
4. **Duas colunas:** **Aplicações** do time (busca e tipo; `<tr data-atlas-row
   data-squad data-type>`) ao lado de **Em breve** (poucas linhas) e
   **Últimas atualizações**.

Sem repetir o menu: saíram "Serviços no catálogo", "Ferramentas" (use o
Toolkit), "Links úteis", "Learning Paths" e "Comece por aqui".

## Toolkit

Botão na barra do topo, ao lado de Buscar, que abre uma grade 3×2 com as
ferramentas externas: Release Notes, GitHub, AWS, SonarQube, Veracode e
Indicadores DevOps. Cada uma abre em nova aba; o menu fecha ao clicar fora,
com Esc ou ao escolher uma. No portal, o componente e a lista moram em
`toolkit.tsx` e a barra (`shell/nav/AtlasTopNav.tsx`) só o posiciona; na
versão avulsa, a barra inteira (Toolkit incluído) vem de `assets/atlas.js`.

## Fontes de dados

Na versão HTML, tudo está escrito no `index.html`: números, serviços,
comunicados e aplicações são exemplo. No Atlas real, números e listas viriam
do catálogo e o editorial (comunicados, links) de Confluence ou de um backend
de avisos.

## Não faz

- Não mostra custos nem alertas: o lab não tem essas fontes.
