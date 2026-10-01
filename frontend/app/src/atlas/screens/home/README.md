# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

A estrutura é a de antes, com as ideias da reunião com o William encaixadas:

1. **Seu time** (faixa fina no topo): lista para escolher o time (Todos,
   Plataforma, Pagamentos, Onboarding, Antifraude, Bitrago), com o champion
   (nome e e-mail) e o link para Meus grupos. A escolha fica no navegador
   (`atlas.team`, padrão `plataforma`), marca o projeto com "seu time" e
   filtra "Serviços no catálogo" e "Aplicações".
2. **Boas-vindas + números**
   - **Boas-vindas** (cartão com degradê verde): saudação que muda com o
     horário — "Bom dia / Boa tarde / Boa noite, bem-vindo ao Atlas" —, "Olá,
     {nome}." quando o login traz o nome, e a caixa **Perguntar** (leva ao
     Agente com o texto, `?q=`).
   - **Cinco números** clicáveis: Aplicações, APIs, Sistemas, Repositórios e
     **Recursos provisionados** (destaque, largura dupla). Os dois últimos
     abrem o mapa (`#repositorios` para a aba de repositórios).
3. **Ações rápidas** — só as que o menu do topo não cobre: Provisionar recurso,
   Buscar no catálogo, Mapa de provisionamento, Solicitar acesso (desabilitada,
   ainda sem tela) e Break Glass.
4. **Provisionado no Atlas** (área central): abas **Recursos** e
   **Repositórios** com a contagem de cada uma, **busca de projeto** e a lista
   por **nome de projeto** (Pagamentos, não PAG) com as ofertas em uso; cada
   linha abre o mapa já filtrado (`/provisioning-map?service=PAG`).
5. **Três cartões:** Serviços no catálogo, Últimas atualizações e **Em breve**
   (borda tracejada, poucas linhas, só entregas previstas; no lugar de
   "Ferramentas", que repetia o Toolkit).
6. **Aplicações** (busca e tipo; `<tr data-atlas-row data-squad data-type>`),
   **Links úteis** e **Learning Paths**.
7. **Comece por aqui** (3 passos).

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
