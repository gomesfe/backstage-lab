# Meus grupos — `/my-groups`

Os grupos e squads de que o usuário faz parte, e o que cada um mantém.
Responde "a que times eu pertenço e o que é nosso?".

**Arquivos:** `MyGroupsPage.tsx`. Registro da rota em `page.tsx`.

## Deve conter

1. **Cabeçalho:** "Organização" · Meus grupos.
2. **Um cartão por grupo**, com:
   - badges "membro" e o tipo do grupo (squad, tribo…), se houver;
   - título e descrição do catálogo;
   - chips com **número de membros** e **itens no catálogo** do grupo;
   - **Ver itens** (catálogo filtrado por esse dono) e **Abrir** (página do
     grupo, ação principal).

## Estados

- Esqueleto: três cartões fantasmas.
- Sem grupo → explica que grupos vêm do catálogo (`examples/org.yaml`) e que,
  sem grupo, o RBAC também não encontra permissões.
- Erro → painel de erro.

## Fontes de dados

- Grupos: `ownershipEntityRefs` da identidade — é exatamente "de que grupos
  faço parte".
- Contagem: entidades do catálogo por `spec.owner`, **normalizado** para a
  ref completa (`group:default/<nome>`). O dono pode vir escrito de três
  formas; comparar sem normalizar zerava a contagem.
