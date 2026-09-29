# Home — `/`

A primeira tela do portal. Responde a "o que está acontecendo no meu escopo
e por onde eu começo?" em uma olhada.

**Arquivos:** `HomePage.tsx` (layout), `sections.tsx` (cada bloco),
`useHomeData.ts` (números e serviços do catálogo), `data.ts` (conteúdo
editorial). Registro da rota em `page.tsx`.

## Deve conter, nesta ordem

1. **Seletor de escopo** — Todos / Pagamentos / Onboarding / Antifraude.
   Filtra métricas e serviços pelo dono. Os escopos vêm de `data.ts`.
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
   - **Serviços no catálogo:** até 8 aplicações do escopo, cada uma um link
     para a entidade, com ponto e badge de ciclo de vida. "Ver todos (N)"
     quando houver mais.
   - **Últimas atualizações:** comunicados de `data.ts`.
   - **Ferramentas:** links externos, abrem em nova aba. A lista é a mesma do
     menu **Toolkit** da barra, em `modules/nav/toolkit.tsx`.
5. **Aplicações** (largura maior) e, ao lado, **Links úteis** e **Em dúvida?**
   - **Aplicações:** todos os Components do escopo numa tabela com
     **Nome · Tipo · Repositório · Sonar**. Busca por nome ("Buscar
     workload…") e filtro por tipo: Todos / Microsserviço / Site Estático /
     Serverless. O tipo vem de `spec.type` (`service` → Microsserviço,
     `website` → Site Estático, `serverless`/`lambda`/`function` →
     Serverless); outro valor aparece cru, em amarelo. Repo vem de
     `github.com/project-slug` ou `backstage.io/source-location`; Sonar de
     `sonarqube.org/project-key` (base em `SONAR_BASE_URL`, `data.ts`). Sem
     anotação, a célula mostra "—".
   - **Links úteis:** de `data.ts`.
   - **Em dúvida? Aprenda mais com Learning Paths:** três trilhas de
     `FEATURED_LEARNING_PATH_IDS` e o botão "Ver todas as trilhas".
6. **Comece por aqui** (3 passos, com atalho para Trilhas).

## Estados

- **Carregando:** esqueleto nas métricas e nos serviços.
- **Vazio:** serviços sem nada no escopo explicam como criar um.
- **Erro do catálogo:** métricas e serviços caem para zero/vazio; o restante
  da Home (editorial) continua útil.

## Fontes de dados

- Catálogo (`catalogApi.getEntities`), uma consulta só, contada no cliente.
- Perfil do usuário (`identityApi.getProfileInfo`) para o nome.
- `data.ts` para o editorial — no Atlas real viria de Confluence ou de um
  backend de avisos; é o único ponto a trocar.

## Não faz

- Não inventa número. Se o catálogo tem 3 squads, a Home mostra 3.
- Não mostra custos nem alertas: o lab não tem essas fontes.
