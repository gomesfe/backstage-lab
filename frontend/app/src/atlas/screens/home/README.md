# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

Segue a reunião com o William (boas-vindas enxuta e dinâmica, área central útil,
sem repetir o menu) e a tela de antes nos blocos de baixo.

1. **Hero aberto** (sem moldura, com uma luz verde discreta ao fundo):
   - **Seu time** — lista pequena acima da saudação (Todos, Plataforma,
     Pagamentos, Onboarding, Antifraude, Bitrago). A escolha fica no navegador
     (`atlas.team`, padrão `plataforma`) e muda o cartão do time, marca o
     projeto com "seu time" e filtra "Serviços no catálogo" e "Aplicações".
   - **Saudação pelo horário:** "Bom dia, Ana." com o nome do login; sem nome,
     "Bom dia, bem-vindo ao Atlas." (Boa tarde a partir de 12h, Boa noite a
     partir de 18h).
   - **Frase de contexto:** aprovações esperando a pessoa e ofertas novas.
   - **Perguntar** (leva ao Agente com o texto, `?q=`) e quatro sugestões que
     preenchem a caixa (`data-atlas-ask-fill`).
   - **Cartão do time** à direita: champion (nome, "Escrever ↗" por e-mail),
     "Meus grupos" e três ações com ícone e rótulo — Provisionar recurso,
     Aprovações (N) e Break Glass. Elas substituem a faixa de ações rápidas.
2. **Faixa de números** (um bloco, cinco colunas): Aplicações, APIs, Sistemas,
   Repositórios e **Recursos provisionados** (fundo verde suave, número em
   verde). Cada coluna abre a tela certa; recursos e repositórios abrem o mapa.
3. **Provisionado no Atlas** (área central, sem moldura): abas **Recursos** e
   **Repositórios** com contagem, busca "projeto ou oferta" e a lista por
   **nome de projeto** com as ofertas em uso; cada linha abre o mapa filtrado
   (`/provisioning-map?service=PAG`).
4. **Três cartões:** Serviços no catálogo, Últimas atualizações e **Em breve**.
5. **Aplicações**, **Links úteis** e **Learning Paths**.
6. **Comece por aqui** (3 passos).

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
