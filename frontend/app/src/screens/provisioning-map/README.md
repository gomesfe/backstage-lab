# Mapa de provisionamento — `/provisioning-map`

Onde cada recurso está provisionado, por qual template e serviço, e o que dá
para promover ou excluir em cada ambiente.

**Arquivos:** `ProvisioningMapPage.tsx`, `provisioningData.ts` (fonte de
dados e regras). Registro da rota em `page.tsx`.

## Deve conter

1. **Cabeçalho:** "Provisionamento" · Mapa de provisionamento. Ação
   **Refresh admin** — só para quem tem `atlas.provisioning.refresh` (hoje,
   só a role admin).
2. **Três números:** **Recursos IaC** · **Serviços Núclea** · **Templates**.
3. **Aviso de regras:** "Deleções solicitadas em até 72 horas não exigem
   aprovação. Alguns recursos podem exigir aprovação do time de cloud antes
   da execução."
4. **Tabela de recursos**
   - Barra: botão **Filtros** (abre Nome, Template, Ambiente, Serviço, e
     mostra quantos filtros estão ativos), **Itens** por página (10, 15, 25,
     50).
   - Colunas: **Nome do recurso** (com selo IaC ou "fora do IaC"),
     **Serviço Núclea** (sigla), **Template**, uma coluna por ambiente —
     **dev · perf · int · ext · prod · prdnv** — e **Detalhes**.
   - **Funil por coluna** em Nome, Serviço e Template: abre um campo de
     pesquisa com **Limpar** e **Fechar**.
   - Célula de ambiente:
     - provisionado → data, e **Excluir** (até 72 h) ou **Solicitar
       exclusão** (depois de 72 h, vai para aprovação);
     - não provisionado → **Promover**;
     - pedido em andamento → selo "exclusão pendente" ou "aguardando cloud";
     - recurso fora do IaC → só a data; o Atlas não mexe nele.
5. **Tabela de repositórios**, com a mesma barra e os mesmos funis:
   Repositório, Serviço Núclea, Template, Recursos, Visibilidade, Criado
   em, Detalhes.

## Regras (em `provisioningData.ts`)

- `FREE_DELETE_WINDOW_HOURS = 72`: exclusão dentro da janela é direta.
- `CLOUD_APPROVAL_ENVS = ['prod', 'prdnv']`: promoção para esses ambientes
  espera o time de cloud.

Excluir e promover sempre pedem confirmação num modal que explica qual das
regras vale para aquele caso.

## Fonte de dados

**Exemplo** — o lab não tem o inventário (no Atlas ele vem do estado do
Terraform e dos PRs de IaC). A tela avisa isso no topo, e as ações mudam só
a sessão. Para ligar no real, troque `loadProvisioning`.
