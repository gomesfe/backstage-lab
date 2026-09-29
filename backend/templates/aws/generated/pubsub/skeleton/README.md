# ${{ values.nome }} (${{ values.ambiente }})

Pub/Sub (SNS + SQS) — Tópico SNS já ligado a uma fila SQS, o padrão de fan-out da casa.

Gerado pelo template `atlas-template-pubsub`.

## O que aplicar

```bash
terraform init
terraform plan
terraform apply
```

O `apply` **não** é feito pelo portal. Este PR só traz o código; quem aplica
é o pipeline do repositório de infraestrutura, depois do merge.

## Convenções que vieram do template

- nome do recurso: `squad-nome-ambiente`
- state no bucket `nuclea-terraform-state`, sob `squad/nome/ambiente.tfstate`
- tags `squad`, `ambiente`, `recurso`, `origem` e `repositorio` em tudo

Mudar isso aqui desalinha este recurso do resto da casa. Se a convenção
precisa mudar, mude no template.
