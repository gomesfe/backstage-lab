# Plugins

| plugin | tipo | o que faz |
| --- | --- | --- |
| `rbac-backend` | módulo do `permission` | política de permissões lida do `rbac-policy.csv` |
| `api-keys-backend` | plugin de backend | emissão, TTL e revogação de API keys |
| `admin` | plugin de frontend | painel em `/admin` que consome o `api-keys-backend` |

## Usando `api-keys-backend` como molde

Os três cobrem as formas que um plugin do Atlas pode ter. Para um plugin de
backend novo com estado próprio, `api-keys-backend` é o molde — ele já resolve
as quatro coisas que todo plugin com tabela precisa resolver:

**1. Migração no lugar certo.** As migrações ficam em `migrations/` na raiz do
pacote e são resolvidas com `resolve(__dirname, '../migrations')`. Isso vale em
dev (rodando de `src/`) e no build (rodando de `dist/`). Veja
[`src/plugin.ts`](api-keys-backend/src/plugin.ts).

**2. `PromiseRouter`, não `Router`.** Handler `async` que lança com o `Router`
do express 4 deixa a requisição pendurada para sempre — o cliente fica girando
e não há erro no log do HTTP. Use `express-promise-router`, que converte a
rejeição em `next(err)` e deixa o middleware de erro do Backstage responder.

**3. Permissões declaradas.** Cada ação ganha uma `createPermission` em
`src/permissions.ts`, e é isso que permite ao `rbac-policy.csv` falar sobre o
plugin. Permissão que não existe não pode ser governada.

**4. Separar "ver os seus" de "ver os dos outros".** O `GET /keys` pede
`api-keys.key.read` para responder, e consulta `api-keys.key.read-all` só para
decidir o tamanho da lista. Quem não é admin recebe 200 com as próprias
chaves, não 403 — negar o que a pessoa nem pediu é ruído.

## Testes

`api-keys-backend` testa o store contra um SQLite real via
`TestDatabases`, não contra mock de knex: migração errada ou coluna com tipo
errado aparece no teste, que é onde deveria aparecer.

```bash
yarn workspace @internal/plugin-api-keys-backend test --watch=false
yarn workspace @internal/plugin-rbac-backend test --watch=false
```
