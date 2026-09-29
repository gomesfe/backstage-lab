# ${{ values.nome }}

${{ values.descricao }}

Criado pelo template `atlas-template-microservice`.

## Rodar

```bash
docker build -t ${{ values.nome }} .
docker run -p ${{ values.porta }}:${{ values.porta }} ${{ values.nome }}
```

## O que já vem pronto

- `GET /health` — o que o orquestrador usa para decidir se o pod está vivo.
  Se ele responder 200 enquanto o serviço não atende, o deploy quebrado passa
  despercebido. Ligue as dependências críticas nele.
- Pipeline em `.github/workflows/ci.yaml`
- `catalog-info.yaml` já registrado no portal — não apague, é o que mantém o
  serviço visível e com dono.
