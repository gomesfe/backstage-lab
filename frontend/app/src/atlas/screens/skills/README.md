# Skills — `/skills`

Catálogo de IA: as skills do repositório **nuclea-ia-skills** — instruções e
fluxos de automação reutilizáveis para agentes e assistentes de IA.

**Arquivos:** a tela do portal é React, em `components/skills/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota; `index.html` fica como referência visual avulsa (abre direto no navegador).


## Deve conter

1. **Cabeçalho** "Catálogo de IA" · Skills, com **Ajuda**, **+ Cadastrar Skill**
   e **Atualizar** (busca de novo no repositório).
2. **Barra:** contagem ("6 skills"), filtro de ambiente **Todos / Release / Hml
   / Dev** (cada cartão tem `data-release`, `data-hml`, `data-dev`) e busca por
   nome ou descrição.
3. **Cartões** (`atlas-featureCard atlas-skillCard`): ícone gerado a partir do
   nome, nome, marcadores de ambiente, descrição, slug, quantos ambientes,
   autor, última atualização e **GitHub**. O cartão inteiro abre o `SKILL.md`
   no GitHub, na versão mais estável (release > hml > dev).
4. **Ajuda** (pop-up "Como funcionam as Skills"): o que é uma skill, os três
   ambientes (dev, hml, release = branches) e como usar a tela.
5. **Cadastrar Skill** (pop-up "Como criar uma nova Skill"): os 6 passos, um
   `SKILL.md` mínimo e o botão **Criar Skill** — no Atlas ele cria a branch com
   o `SKILL.md` de exemplo; aqui só fecha o pop-up.

## Fonte de dados

As pastas `skills/<nome>/SKILL.md` das branches `dev`, `hml` e `release` de
`NucleaSA/nuclea-ia-skills` (front-matter `name` e `description`, autor e data
do último commit).
