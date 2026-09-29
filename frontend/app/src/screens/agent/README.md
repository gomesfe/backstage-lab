# Agente do Atlas — `/agent`

Chat com o agente do portal, com histórico. O agente responde com o Claude e
consulta o catálogo **com as permissões de quem está conversando** — enxerga
exatamente o que a pessoa enxergaria no portal.

**Arquivos:** `AgentPage.tsx` (tela), `agentClient.ts` (API e leitura do
stream). Registro em `modules/pages/pagesPlugin.tsx`. Backend em
`backend/atlas-agent`.

## Deve conter

1. **Cabeçalho:** "Assistente" · Agente do Atlas.
2. **Aviso "Agente ainda não configurado"** quando o backend não tem
   credencial da Anthropic — com o motivo e o que fazer. O histórico continua
   legível; o campo de mensagem fica desabilitado.
3. **Histórico (coluna da esquerda):** **Nova conversa** e a lista das
   conversas da pessoa, da mais recente para a mais antiga, com título (a
   primeira pergunta) e quando foi a última mensagem. Apagar pede confirmação.
4. **Conversa (direita)**
   - título da conversa e o modelo em uso;
   - conversa vazia: "Como posso ajudar?", o que o agente faz e não faz, e
     **4 sugestões** de pergunta;
   - mensagens: as suas à direita (iniciais), as do agente à esquerda, em
     Markdown; acima de cada resposta, as **consultas que o agente fez**
     ("Buscou no catálogo · website");
   - a resposta aparece **enquanto é escrita** (três pontos antes do primeiro
     texto);
   - links do agente para telas do portal navegam sem recarregar, e o
     "voltar" do navegador retorna à conversa.
5. **Campo de mensagem:** Enter envia, Shift + Enter quebra linha; durante a
   resposta vira **Parar**. Resposta interrompida aparece marcada e não é
   salva.

A conversa aberta fica na URL (`?c=<id>`).

## O que o agente faz — e não faz

- **Faz:** busca no catálogo (aplicações, APIs, sistemas, recursos, squads,
  templates) e detalha entidades; explica as telas do portal e manda o link.
- **Não faz:** nada que altere estado — não provisiona, não aprova, não cria
  chave. Indica a tela para a pessoa fazer.

## Backend (`backend/atlas-agent`)

- Rotas: `GET /status`, `GET/POST /conversations`,
  `GET/PATCH/DELETE /conversations/:id`, e
  `POST /conversations/:id/messages`, que responde por **Server-Sent
  Events** (`activity`, `delta`, `reset`, `done`, `failed`).
- Conversas e mensagens ficam no banco do plugin, por usuário; uma pessoa
  nunca lê a conversa de outra.
- Modelo: SDK oficial `@anthropic-ai/sdk`, `claude-opus-5`, raciocínio
  adaptativo, streaming e cache automático do prefixo. Com **fallback do
  servidor** (`fallbacks: "default"`): se o modelo recusar um pedido, a API
  refaz no modelo recomendado dentro da mesma chamada.
- Ferramentas: `buscar_catalogo` e `detalhar_entidade`, só leitura, com as
  credenciais do usuário; toda entrada vinda do modelo é validada antes.

## Configurar

1. `ANTHROPIC_API_KEY=...` no `.env` do portal (nunca no app-config).
2. Reinicie o backend. O aviso some e o campo libera.

Opcional, no `app-config.yaml`:

```yaml
atlas:
  agent:
    model: claude-opus-5   # padrão
    effort: medium         # low | medium | high | xhigh | max — medium é o padrão para chat
    maxToolRounds: 6       # consultas por resposta
```
