# ${{ values.nome }} (${{ values.ambiente }})

Secret no Secrets Manager — Segredo versionado e rotacionável, sem valor no Terraform.

Gerado pelo template `atlas-template-secrets-manager`.

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
