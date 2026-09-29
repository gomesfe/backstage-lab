# Backend

O que roda no servidor: o Backstage (catálogo, ofertas, busca, login,
notificações) e os plugins próprios do Atlas. **Não importa nada do frontend.**

```
backend/
├── server/            o processo do backend: junta o Backstage e os plugins abaixo
├── api-keys/          emissão, TTL e revogação de API keys        → /api/api-keys
├── atlas-agent/       agente do Atlas (Claude + catálogo)         → /api/atlas-agent
├── rbac/              política de permissões lida do CSV
├── scaffolder-atlas/  ações das ofertas (atlas:mode, atlas:publish:local)
├── rbac-policy.csv    quem pode o quê   →  ../docs/rbac.md
├── templates/         as ofertas (templates do scaffolder); os AWS são gerados
└── examples/          entidades de exemplo do catálogo (usuário, squads, componentes)
```

Guia de como criar um plugin de backend novo (o `api-keys` é o molde):
[PLUGINS.md](PLUGINS.md).

## A única ligação com o front

`server/package.json` tem `"app": "link:../../frontend/app"`. É o que permite ao
backend **servir o portal já construído** (modo Tailscale, uma porta só). Em
desenvolvimento o front roda separado e essa ligação não é usada.

## O que o backend precisa para rodar

- `app-config.yaml` (e os `app-config.*.yaml`) na raiz — compartilhados com o front.
- `.env` na raiz: `GITHUB_TOKEN`, OAuth do GitHub e `ANTHROPIC_API_KEY` (agente).
  Todos opcionais para subir; sem eles, a função correspondente avisa o que falta.
- Banco: Postgres (`yarn db:up`) ou SQLite (`yarn start:sqlite`).

## Rodar

```bash
yarn start:backend   # só o backend, em :7007
yarn start           # backend + front
```
