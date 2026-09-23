# RBAC

As permissões do portal vêm de um único arquivo: [`rbac-policy.csv`](../rbac-policy.csv).

## Formato

```
p, <role>, <permissão ou resourceType>, <ação>, <allow|deny>
g, <user:default/... ou group:default/...>, <role>
```

`p` é uma regra, `g` é um vínculo entre alguém e uma role. É o mesmo formato
do plugin RBAC do Backstage, que por sua vez segue o casbin — então o que você
escrever aqui é transferível.

O segundo campo de uma regra casa **ou** com o nome da permissão
(`catalog.entity.delete`) **ou** com o `resourceType` dela (`catalog-entity`).
Use o resourceType para liberar uma família inteira e o nome para abrir uma
exceção pontual.

## As duas garantias

**Deny ganha de allow.** Não importa a ordem das linhas nem de qual role veio.
Um `deny` em qualquer role do usuário derruba o acesso.

**O padrão é fechado.** O que não aparece no arquivo fica negado.

Juntas, elas dão a propriedade que torna o arquivo auditável: para responder
"quem pode apagar entidade do catálogo?", basta ler as linhas que mencionam
`catalog.entity.delete` ou `catalog-entity`. Não é preciso simular a ordem de
avaliação nem carregar o resto do arquivo na cabeça.

## Roles do lab

| role | para quem | o que pode |
| --- | --- | --- |
| `admin` | plataforma | tudo |
| `atlas` | desenvolvedor | lê o catálogo, usa templates, gerencia as próprias API keys |
| `guest` | não autenticado de fato | só leitura |

## Editar em execução

Com `permission.rbac.watch: true` no `app-config.yaml`, salvar o CSV recarrega
as regras sem reiniciar o backend. O log confirma:

```
permission info RBAC recarregado: 18 regra(s), 4 vínculo(s)
```

Se o arquivo ficar inválido, o backend **mantém a última versão boa** e loga o
erro. Um CSV quebrado não pode abrir nem fechar o portal por acidente.

## Por que você precisa estar no org.yaml

O login do GitHub é resolvido por `usernameMatchingUserEntityName`: seu
username vira `user:default/<username>`. O RBAC procura vínculos para esse ref
e para os grupos que o catálogo diz que você pertence.

Sem uma entidade `User` em [`examples/org.yaml`](../examples/org.yaml), o
catálogo não conhece seus grupos, nenhum vínculo casa, e o default fechado te
deixa de fora. Ao adicionar alguém ao portal, adicione nos dois lugares.

## Ambientes

O front sabe em que ambiente está por `atlas.env` no `app-config.yaml`
(`local`, `dev`, `lab` ou `prod`), exposto pela `atlasEnvApiRef` do
`@internal/plugin-components`. O selo na sidebar mostra qual é.

Um valor desconhecido **derruba o app na inicialização**, de propósito: `prd`
em vez de `prod` desligaria em silêncio tudo que é condicionado a produção.

Isso vem de config e não de variável de build: o mesmo bundle serve todos os
ambientes. O Atlas usa `env.json` em tempo de build, que permite tree-shaking
mas obriga um bundle por ambiente — se você quiser essa forma aqui, o ponto
de troca é só `createAtlasEnv`.

## Testar uma mudança

Os testes da política estão em
[`plugins/rbac-backend/src/AtlasPermissionPolicy.test.ts`](../plugins/rbac-backend/src/AtlasPermissionPolicy.test.ts)
e rodam contra CSVs escritos inline — é o lugar barato para provar que uma
regra nova faz o que você acha que faz.

```bash
yarn workspace @internal/plugin-rbac-backend test --watch=false
```
