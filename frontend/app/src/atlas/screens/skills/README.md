# Skills do agente — `/skills`

O que o Agente do Atlas sabe fazer, de onde tira a informação e o que ainda
está por vir.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

## Deve conter

1. **Cabeçalho** com o botão **Abrir o agente**.
2. **Aviso:** o agente roda com as credenciais de quem conversa (o RBAC vale
   para ele) e as skills ativas só leem dados.
3. **Três números:** skills ativas, em breve e o tipo de acesso.
4. **Tabela de skills** — nome e id, o que faz, fonte (Catálogo, Ofertas,
   Mapa, Aprovações), acesso (leitura ou escrita com confirmação), situação
   (ativa / em breve) e **Detalhes**. Filtro Todas / Ativas / Em breve e busca.
5. **Detalhes** (pop-up): o que faz, parâmetros (`*` = obrigatório), exemplos
   de pergunta e, nas ativas, **Perguntar ao agente**, que abre o Agente com o
   exemplo preenchido (`?q=`).

## Fonte de dados

As skills **ativas** são as ferramentas reais do agente, em
`backend/atlas-agent/src/agent/tools.ts` (`buscar_catalogo` e
`detalhar_entidade`): nome, descrição e parâmetros vêm de lá — ao mudar uma
ferramenta, atualize esta tela. As **em breve** são propostas (provisionar
pelo chat, consultar o mapa, acompanhar aprovações) e não existem no backend.
