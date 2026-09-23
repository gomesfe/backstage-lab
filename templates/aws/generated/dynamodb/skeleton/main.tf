# Gerado pelo template "Tabela DynamoDB" do Atlas.
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
    recurso    = "dynamodb"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/dynamodb-table/aws"
  version = "4.2.0"

  name                                   = local.name
  hash_key                               = "${{ values.hashKey }}"
  billing_mode                           = "${{ values.billingMode }}"
  point_in_time_recovery_enabled         = ${{ values.pointInTimeRecovery }}
  attributes                             = [{ name = "${{ values.hashKey }}", type = "S" }]

  tags = local.tags
}
