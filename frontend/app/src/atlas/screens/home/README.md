# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

Quatro partes, cada uma com uma função (o resto está no menu do topo):

1. **Boas-vindas + números**
   - Cartão de boas-vindas com degradê verde: saudação pelo horário ("Bom dia /
     Boa tarde / Boa noite, bem-vindo ao Atlas"; "Olá, {nome}." quando o login
     traz o nome), caixa **Perguntar** (leva ao Agente com o texto, `?q=`) e,
     no rodapé do cartão, **Seu time** (Todos, Plataforma, Pagamentos,
     Onboarding, Antifraude, Bitrago) com o champion. A escolha fica no
     navegador (`atlas.team`, padrão `plataforma`), marca o projeto com "seu
     time" e filtra "Aplicações do time".
   - Cinco números: Aplicações, APIs, Sistemas, Repositórios e **Recursos
     provisionados** (bloco verde, texto branco). Recursos e repositórios
     abrem o mapa (`#repositorios` para a aba de repositórios).
2. **Provisionado no Atlas** — abas Recursos e Repositórios com contagem, busca
   de projeto e a lista por nome de projeto com as ofertas em uso; cada linha
   abre o mapa filtrado (`/provisioning-map?service=PAG`).
3. **Aplicações do time** (busca e tipo; `<tr data-atlas-row data-squad
   data-type>`) ao lado de **Últimas atualizações** e **Em breve** (poucas
   linhas, só entregas previstas).
4. **Links úteis** numa linha: Onboarding, Arquitetura, Runbooks, Catálogo de
   ofertas, Break Glass e Trilhas.

Saíram por repetirem o menu ou outro bloco: ações rápidas, Serviços no catálogo
(é a lista de Aplicações), Ferramentas (é o Toolkit), Learning Paths e Comece
por aqui (viraram o link "Trilhas").

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
