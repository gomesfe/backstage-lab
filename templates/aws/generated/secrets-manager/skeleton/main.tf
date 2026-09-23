# Gerado pelo template "Secret no Secrets Manager" do Atlas.
# Ajuste à vontade: a partir do merge, este arquivo é do time dono.

terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "nuclea-terraform-state"
    key    = "${{ values.squad | replace("group:default/", "") }}/${{ values.nome }}/${{ values.ambiente }}.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.regiao
}

locals {
  name = "${var.squad}-${var.nome}-${var.ambiente}"

  tags = {
    squad      = var.squad
    ambiente   = var.ambiente
    recurso    = "secrets-manager"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/secrets-manager/aws"
  version = "1.3.1"

  name                                   = local.name
  description                            = "Secret de ${{ values.nome }} (${{ values.ambiente }})"
  recovery_window_in_days                = ${{ values.recoveryWindowDays }}
  create_random_password                 = false
  ignore_secret_changes                  = true

  tags = local.tags
}
