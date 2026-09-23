# Software templates

O Atlas tem 28+ templates, mas poucas **formas** distintas por baixo. Este lab
constrói uma exemplar completa de cada forma, e gera as repetições.

## As formas

| forma | exemplares aqui | o que faz |
| --- | --- | --- |
| recurso AWS | 14, gerados | gera Terraform e abre PR na infraestrutura |
| entidade de catálogo | `cadastrar-squad` | gera YAML de org e abre PR no catálogo |
| repositório novo | `microservice` | cria repo, popula e registra no catálogo |
| tela do portal | `static-page` | gera HTML/CSS e abre PR no repo de front |

Os que faltam do Atlas encaixam nessas formas:

- `cadastrar-tribo`, `cadastrar-servico-nuclea` → como `cadastrar-squad`
- `create-repo`, `criar-repositorio-qa`, `library` → como `microservice`
- `create-account`, `create-ou`, `create-terraform-module` → como os de AWS,
  com specs próprios
- `deletion-resource` → forma nova: precisa achar o recurso no catálogo e
  abrir PR removendo o `.tf`, não criando

## Por que os 14 de AWS são gerados

Eles são o mesmo template com inputs diferentes. Todos perguntam
nome/squad/ambiente, todos geram um módulo Terraform com **o mesmo backend, a
mesma convenção de nome e as mesmas tags**, e todos abrem PR no repositório de
infraestrutura.

Escritos à mão, mudar a convenção de tags significaria editar 14 arquivos — e
esquecer um. Aqui a convenção mora em `scripts/generate-aws-templates.mjs` e
cada spec diz só o que é específico do recurso.

### Adicionar um recurso

Crie `templates/aws/specs/<slug>.yaml`:

```yaml
slug: opensearch
title: Cluster OpenSearch
description: Busca e observabilidade.
category: Armazenamento
module:
  source: terraform-aws-modules/opensearch/aws
  version: 1.5.0
parameters:            # perguntas específicas deste recurso
  - id: instanceType
    title: Tipo da instância
    type: string
    default: t3.small.search
    enum: [t3.small.search, r6g.large.search]
inputs:                # inputs do módulo Terraform, em HCL
  cluster_name: local.name
  instance_type: '"${{ values.instanceType }}"'
```

Depois `yarn templates:sync`. Os arquivos em `templates/aws/generated/` são
versionados de propósito — o catálogo os lê do disco, não os gera.

`yarn templates:check` falha se o gerado divergir do spec. Vale plugar em CI:
sem isso, alguém edita o gerado à mão e a próxima `sync` descarta o trabalho
em silêncio.

## Exercitar um template sem GitHub

`atlas.provisioning.mode` no `app-config.yaml` decide como o template publica:

| modo | o que faz |
| --- | --- |
| `github` | abre Pull Request de verdade. Precisa de `GITHUB_TOKEN`. |
| `local` | escreve os arquivos em `.atlas-out/` e não toca em nada remoto. |

No modo `local` você percorre o fluxo inteiro — Choose, formulário, Review,
Create, log da tarefa — e inspeciona exatamente o que iria no PR. A pasta de
saída leva o id da tarefa no nome, então duas execuções do mesmo template não
se sobrescrevem e dá para comparar.

A escolha é do ambiente, não de quem preenche o formulário: como campo do
formulário, alguém escolheria `local` em produção achando que era um ensaio, e
o recurso nunca seria provisionado. Por isso `mode: local` com `atlas.env:
prod` falha na inicialização.

Cada template ganha três passos em vez de um:

```yaml
- id: mode          # traz o modo do config para dentro do alcance do `if:`
  action: atlas:mode
- id: local
  if: ${{ steps.mode.output.isLocal }}
  action: atlas:publish:local
- id: pr
  if: ${{ steps.mode.output.isGithub }}
  action: publish:github:pull-request
```

O passo `atlas:mode` existe porque o `if:` de um passo só enxerga parâmetros e
saídas de outros passos — não enxerga o `app-config`.

## Duas armadilhas de contexto

**`values` só existe dentro do skeleton.** No input de um passo — `targetPath`,
`branchName`, `title` — o contexto é `parameters` e `steps`. Usar `values` ali
renderiza vazio, e o erro que aparece é sobre caminho inválido, não sobre a
variável.

**Permissões sem ação.** `scaffolder.action.execute` declara `attributes: {}`.
No `rbac-policy.csv`, só o curinga na coluna de ação casa com ela:
`p, role:default/atlas, scaffolder-action, *, allow`.

## O que o portal não faz

Nenhum template roda `terraform apply`. Eles abrem PR. Quem aplica é o
pipeline do repositório de infraestrutura, depois do merge e da revisão.

Isso é decisão, não limitação: o portal não deveria ter credencial capaz de
criar recurso em produção, e o PR é onde a revisão de custo e de segurança
acontece.

## Registro no catálogo

`templates/locations.yaml` é uma `Location` única com todos os templates, e é
gerada junto. O `app-config.yaml` aponta só para ela — adicionar um template
não mexe em configuração.
