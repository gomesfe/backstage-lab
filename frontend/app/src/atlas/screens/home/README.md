# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal). `toolkit.tsx` é o menu Toolkit da barra do portal (a versão avulsa tem o seu em `assets/atlas.js`).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

## Deve conter, nesta ordem

1. **Seletor de escopo** — Todos / Pagamentos / Onboarding / Antifraude.
   Filtra os serviços e as aplicações pelo squad dono (`data-squad` de cada
   linha). As métricas são fixas na versão HTML.
2. **Hero**
   - **Boas-vindas:** "Olá, {primeiro nome}" (do perfil de login; o guest vê
     "Bem-vindo ao Atlas"), uma frase e duas ações: **Provisionar recurso**
     (principal, vai para Create) e **Explorar catálogo**.
   - **Cinco métricas clicáveis**, cada uma com uma linha de contexto real e
     levando ao catálogo já filtrado:

     | Métrica | Contexto | Leva para |
     |---|---|---|
     | Aplicações | quantas em produção / experimentais | `/catalog?kind=Component` |
     | APIs | idem | `/api-docs` |
     | Sistemas | quantas aplicações vinculadas a um sistema | `/catalog?kind=System` |
     | Squads no escopo | — | `/catalog?kind=Group` |
     | **Recursos provisionados** (destaque, largura dupla) | o que são, ou como criar o primeiro | `/catalog?kind=Resource` |

     Só uma métrica em destaque: recursos, porque provisionar é a ação
     principal do Atlas.
3. **Ações rápidas** — sete atalhos com ícone por significado. A que ainda
   não tem tela no lab (Solicitar acesso) aparece desabilitada, com dica.
4. **Três cartões lado a lado**
   - **Serviços no catálogo:** aplicações do escopo, cada uma um link para a
     tela de Entidade, com ponto e badge de ciclo de vida. "Ver todos (N)"
     quando houver mais.
   - **Últimas atualizações:** comunicados (no `index.html`).
   - **Ferramentas:** links externos, abrem em nova aba. A lista é a mesma do
     menu **Toolkit** (`toolkit.tsx` no portal, `assets/atlas.js` na versão
     avulsa — mude nos dois).
5. **Aplicações** (largura maior) e, ao lado, **Links úteis** e **Em dúvida?**
   - **Aplicações:** as aplicações numa tabela com
     **Nome · Tipo · Repositório · Sonar**. Busca por nome ("Buscar
     workload…") e filtro por tipo: Todos / Microsserviço / Site Estático /
     Serverless. Cada linha é um `<tr data-atlas-row data-type="…">` —
     `microservice`, `static-site` ou `serverless` — e é esse atributo que o
     filtro lê. Sem repositório ou sem Sonar, a célula mostra "—". Com dado
     real, o tipo viria de `spec.type` e os links das anotações
     `github.com/project-slug` e `sonarqube.org/project-key`.
   - **Links úteis:** cinco links para Docs e Ofertas.
   - **Em dúvida? Aprenda mais com Learning Paths:** três trilhas (links
     para a seção de cada uma em Trilhas) e o botão "Ver todas as trilhas".
6. **Comece por aqui** (3 passos, com atalho para Trilhas).

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
