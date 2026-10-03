# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** a tela do portal é React, em `components/home/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota.


## Deve conter, nesta ordem

Quatro partes, cada uma com uma função (o resto está no menu do topo):

1. **Boas-vindas + números**
   - Cartão de boas-vindas com degradê verde: saudação pelo horário ("Bom dia,
     **Ana**" com o nome do login; "Bom dia, bem-vindo ao Atlas" sem nome; Boa
     tarde a partir de 12h, Boa noite a partir de 18h), caixa **Perguntar** (leva ao Agente com o texto, `?q=`) e,
     no rodapé do cartão, **Seu time** (Todos, Plataforma, Pagamentos,
     Onboarding, Antifraude, Bitrago) com o champion. A escolha fica no
     navegador (`atlas.team`, padrão `plataforma`), marca o projeto com "seu
     time" e filtra "Aplicações do time".
   - **Números em três blocos de dois** (os pares que o chefe marcou no print):
     **Aplicações + Squads no escopo**; **APIs + Recursos provisionados** (bloco
     verde, texto branco); **Sistemas + Repositórios**. Cada linha abre a tela
     certa; Recursos e Repositórios abrem o mapa (`#repositorios`).
   - **Carga em segundo plano:** enquanto o catálogo responde, cada número
     mostra um skeleton; o resto da tela não espera.
2. **Provisionado no Atlas** — abas Recursos e Repositórios com contagem, busca
   de projeto e a lista por nome de projeto com as ofertas em uso; cada linha
   abre o mapa filtrado (`/provisioning-map?service=PAG`). Na aba Recursos,
   filtro de **ambiente** (dev, perf, int, ext, prod, prdnv): a contagem da aba
   e de cada projeto passa a ser só daquele ambiente (preferência `atlas.env`).
   As listas rolam por conta própria quando passam de ~400px.
3. **Aplicações do time** (serviços catalogados; busca e tipo) ao lado de
   **Últimas transações** (os cinco pedidos mais recentes da tela de
   Aprovações, com ambiente, data e situação). Logo abaixo, lado a lado,
   **Últimas atualizações** e **Em breve** (poucas linhas, só entregas
   previstas).
4. **Links úteis** numa linha: Onboarding, Arquitetura, Runbooks, Catálogo de
   ofertas, Break Glass e Trilhas.

Saíram por repetirem o menu ou outro bloco: ações rápidas, Serviços no catálogo
(é a lista de Aplicações), Ferramentas (é o Toolkit), Learning Paths e Comece
por aqui (viraram o link "Trilhas").

## Toolkit

Botão na barra do topo, ao lado de Buscar, que abre uma grade 3×2 com as
ferramentas externas: Release Notes, GitHub, AWS, SonarQube, Veracode e
Indicadores DevOps. Cada uma abre em nova aba; o menu fecha ao clicar fora,
com Esc ou ao escolher uma. O componente e a lista moram em
`shell/nav/ToolkitMenu.tsx`; a barra (`shell/nav/AtlasTopNav.tsx`) só o
posiciona.

## Fontes de dados

- **Catálogo** (`hooks/useHomeCatalogo.ts`): os números de aplicações, squads,
  APIs e sistemas, e as aplicações do time, com Repo e Sonar das anotações
  `github.com/project-slug` e `sonarqube.org/project-key`.
- **Mapa de provisionamento** (mesmo hook da tela do mapa): recursos e
  repositórios por serviço.
- **Aprovações** (mesmo hook da tela): últimas transações.
- **Editorial** (`data.ts`): times e champions, atualizações, Em breve e links
  úteis. No Atlas real viriam de Confluence ou de um backend de avisos.

## Não faz

- Não mostra custos nem alertas: o lab não tem essas fontes.
