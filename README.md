# portal — lab de Backstage

Backstage rodando local, com um caminho para criar telas novas **sem escrever
React**: você solta um site estático em `static-pages/` e ele vira uma rota do
portal.

## O que tem aqui

```
packages/app        front-end (React) — o "repo de front"
packages/backend    back-end (Node) — catalog, scaffolder, auth, techdocs
plugins/            plugins próprios: rbac-backend, api-keys-backend, admin
rbac-policy.csv     quem pode o quê  →  docs/rbac.md
static-pages/       as telas em HTML/CSS puro  ←  trabalho do dia a dia
scripts/            o pipeline que valida e pluga as telas no front
templates/          software template "Tela estática" (abre PR com a tela nova)
```

O visual segue o Atlas Design System, portado quase verbatim do redesign:

- [`packages/app/src/modules/theme/atlas-ds.css`](packages/app/src/modules/theme/atlas-ds.css)
  — as ~200 classes do design (`atlas-sectionCard`, `atlas-badgeTag`, `atlas-qaCardBtn`, …).
  As telas consomem estas classes diretamente, não uma tradução em `makeStyles`.
- [`plugins/components/src/tokens.ts`](plugins/components/src/tokens.ts) — os
  mesmos tokens em TypeScript, para o tema do MUI e para o mapeamento do
  `@backstage/ui` (`bui-tokens.css`).

O código-fonte do redesign fica fora do repo, em `../design-ref/`, como
referência — é para lá que se volta ao portar uma tela nova ou verificar se
uma classe já existe antes de inventar uma.

Permissões e login em [`docs/rbac.md`](docs/rbac.md), plugins em
[`plugins/README.md`](plugins/README.md), software templates em
[`docs/templates.md`](docs/templates.md).

`packages/app` e `packages/backend` são dois deployables independentes — é
assim que o Backstage separa front e back. Eles moram no mesmo repo porque
compartilham `app-config.yaml`, versões e tipos; separar em dois repositórios
te obriga a versionar o config e os pacotes `@backstage/*` em duplicata, que é
a dor que o monorepo existe para evitar.

## Subir

Pré-requisitos: Node 22 (`.nvmrc`), yarn via corepack, Docker Desktop.

```bash
nvm use 22.23.2
corepack enable
yarn install
cp .env.example .env     # GITHUB_TOKEN e o OAuth App, veja o próprio arquivo
yarn db:up               # Postgres no Docker
yarn start               # front em :3000, back em :7007
```

Sem Docker no momento? `yarn start:sqlite` usa um SQLite em memória. Para
voltar ao Postgres: `yarn db:pg`.

### Por que front e back sobem em processos separados

`yarn start` roda dois processos com `concurrently`, em vez do
`backstage-cli repo start` que o `create-app` gera.

O motivo é concreto: com os dois no mesmo processo pai, o backend conversa com
esse pai por IPC para carregar o dev store — e quando o webpack do front satura
a máquina, essa chamada estoura o timeout. O sintoma é feio e enganoso: o
backend derruba metade dos plugins com `IPC request 'DevDataStore.load' timed
out`, o front continua servindo normalmente, e o portal aparece vazio como se
fosse problema de catálogo.

`yarn start:together` mantém o comportamento original, se você quiser comparar.

## Acessar de outros dispositivos

O portal roda na sua máquina e fica alcançável pelos seus outros aparelhos
através da rede Tailscale — sem abrir porta no roteador e sem nada exposto
publicamente.

```bash
# uma vez
& "$env:ProgramFiles\Tailscale	ailscale.exe" up   # login
# ative MagicDNS e HTTPS Certificates em
# https://login.tailscale.com/admin/dns

yarn build:hosted        # a cada mudança no código
yarn serve:tailscale
```

O endereço aparece no terminal (`https://<sua-máquina>.<tailnet>.ts.net`).

Três diferenças em relação a `yarn start`:

- **Uma porta só.** O backend serve também o bundle do frontend, então não há
  CORS entre origens e o endereço do portal é um só — que é o que você quer
  digitar no celular.
- **Sem hot reload.** É bundle construído; mexeu no código, `yarn build:hosted`
  de novo.
- **SQLite em arquivo, em `.atlas-data/`.** Não depende do Docker estar de pé,
  e catálogo, tarefas e API keys sobrevivem ao reinício. Para usar o Postgres,
  suba com `yarn db:up` e apague o bloco `database` do
  `app-config.tailscale.yaml`.

O login guest continua ligado nesse modo: na rede Tailscale só entram os seus
dispositivos. Ao expor o portal fora do tailnet, remova o bloco `auth` do
`app-config.tailscale.yaml` e ligue o OAuth do GitHub.

## Criar uma tela

```bash
yarn pages:new custos-por-time "Custos por Time"
yarn pages:preview custos-por-time    # só a tela, live reload, :4100
yarn start                            # a tela dentro do portal
```

A tela aparece em `/p/custos-por-time` e na sidebar.

As regras que o `index.html` precisa seguir — e o porquê de cada uma — estão em
[`static-pages/README.md`](static-pages/README.md). `yarn pages:sync` reprova o
build apontando arquivo e linha quando alguma é quebrada, e roda sozinho antes
de `yarn start` e `yarn build:all`.

## Pelo portal, sem terminal

Com `GITHUB_TOKEN` preenchido, o template **Tela estática** aparece em
`/create`. Ele pergunta slug, título e ícone e abre um Pull Request neste repo
adicionando `static-pages/<slug>/`. É o mesmo fluxo do template estático do
portal de dev — a diferença é que aqui a tela nasce já dentro do front.

## Como funciona por baixo

1. `scripts/sync-static-pages.mjs` lê `static-pages/*/`, valida contra as
   regras e gera `packages/app/src/modules/static-pages/generated.ts` com o
   HTML e o CSS embutidos. Assets vão para `packages/app/public/static-pages/`
   e as referências `assets/...` são reescritas para caminhos absolutos.
2. `staticPagesPlugin.tsx` cria uma extensão de página do Backstage por tela,
   com rota e item de sidebar.
3. `StaticPageFrame.tsx` monta o HTML dentro de um **Shadow DOM** e injeta as
   variáveis `--bs-*` a partir do tema ativo. O isolamento é o que permite
   liberar seletores amplos no CSS da tela sem quebrar o portal.

Os dois artefatos gerados (`generated.ts` e `public/static-pages/`) são
derivados e estão no `.gitignore` — a fonte da verdade é `static-pages/`.
