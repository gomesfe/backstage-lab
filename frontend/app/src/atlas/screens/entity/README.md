# Entidade — `/entidade#<tipo>-<nome>`

A página de uma entidade do catálogo: aplicação, API, sistema, recurso ou
squad. Chega-se a ela pelos nomes em Home, Catálogo, APIs, Docs, Buscar e
Meus grupos. Cada entidade é uma aba; o `#` do endereço escolhe qual
(ex.: `#component-payments-api`, `#api-payments-api`, `#group-pagamentos`).
Sem `#`, mostra a lista de todas.

**Arquivos:** a tela do portal é React, em `components/entity/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota.


## Deve conter

1. **Cabeçalho** com trilha "Home › Catálogo (ou APIs) › nome", tipo, nome,
   descrição, estrela de favorito e "Voltar para o catálogo".
2. **Sobre:** tipo, dono (leva ao squad), ciclo de vida, sistema (leva ao
   sistema), tags (levam ao Catálogo filtrado por `?q=`) e atalhos para
   repositório, Sonar e documentação.
3. **Relações**, conforme o tipo:
   - aplicação: APIs que fornece e as outras aplicações do mesmo sistema;
   - sistema: as aplicações dele;
   - squad: membros e itens mantidos, com "Abrir no catálogo" (`?owner=`);
   - API: a definição (OpenAPI, gRPC ou AsyncAPI) e quem a fornece;
   - recurso: links para o Mapa de provisionamento e Aprovações.
4. **Documentação** (quem publica TechDocs): visão geral, como rodar e
   runbook, com "Ver em Docs". É para onde os itens de Docs apontam
   (`#…-docs`).
