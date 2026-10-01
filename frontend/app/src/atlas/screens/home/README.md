# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

Segue a reunião com o William: boas-vindas enxuta, área central útil, sem
repetir o menu do topo (por isso não há "ações rápidas").

1. **Hero com degradê verde** (`atlas-welcomeCard atlas-heroBig`):
   - **Boas-vindas:** saudação dinâmica ("Bom dia, {nome}"; o guest vê
     "Bem-vindo ao Atlas") e a caixa **Perguntar**, que leva ao Agente com o
     texto (`?q=`).
   - **Seu time** (cartão à direita): lista para **trocar de time** (Todos,
     Plataforma, Pagamentos, Onboarding, Antifraude, Bitrago), com o champion
     (nome e e-mail) e o link para Meus grupos. A escolha fica no navegador
     (`atlas.team`, padrão `plataforma`), marca o projeto com "seu time" e
     filtra as aplicações.
2. **Provisionado no Atlas** (área central): abas **Recursos** e
   **Repositórios**, cada uma com a contagem, e **busca de projeto**. A lista
   usa nomes de projeto (Pagamentos, não PAG) com as ofertas em uso; o botão de
   cada linha abre o mapa já filtrado (`/provisioning-map?service=PAG`, e
   `#repositorios` na outra aba). Os nomes e contagens são os do próprio mapa.
   Com dado real as contagens viriam de um endpoint, com `atlas-skeleton`
   até chegarem, sem travar a abertura da home.
3. **Duas colunas, na parte de baixo:** **Aplicações** do time (busca e tipo;
   `<tr data-atlas-row data-squad data-type>`) ao lado de **Últimas
   atualizações**, **Em breve** (poucas linhas, só entregas previstas) e
   **Links úteis**.

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
