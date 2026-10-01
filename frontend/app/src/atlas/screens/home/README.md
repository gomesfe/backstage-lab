# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

Uma coisa por bloco, sem repetir o que já está no menu:

1. **Boas-vindas com pergunta** — saudação dinâmica ("Bom dia, {nome}"; o
   guest vê "Bem-vindo ao Atlas"), caixa **Perguntar** (leva ao Agente com o
   texto, `?q=`) e quatro atalhos: Provisionar recurso, Mapa de provisionamento,
   Aprovações e Trilhas.
2. **Quatro números** clicáveis: Aplicações, APIs, **Recursos provisionados**
   e **Repositórios** (os dois últimos abrem o mapa; `#repositorios` abre a
   aba de repositórios). Com dado real as contagens viriam de um endpoint e
   mostrariam `atlas-skeleton` até chegar, sem travar a abertura da home.
3. **Escopo** — Todos / Pagamentos / Onboarding / Antifraude. Filtra as linhas
   de "Provisionado por serviço" e de "Aplicações" (`data-squad`).
4. **Duas colunas** (2/3 e 1/3):
   - **Provisionado por serviço** (tabela: nome do projeto, recursos,
     repositórios; cada número abre o mapa já filtrado, `?service=PAG`) ao
     lado de **Seu time** (champion; proposta a validar) e **Em breve**
     (poucas linhas, só entregas previstas).
   - **Aplicações** (busca e filtro por tipo; `<tr data-atlas-row
     data-type="…">`) ao lado de **Últimas atualizações**.

Saíram, por repetirem o menu ou o Toolkit: "Serviços no catálogo", "Ferramentas",
"Links úteis", "Learning Paths" e "Comece por aqui".

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
