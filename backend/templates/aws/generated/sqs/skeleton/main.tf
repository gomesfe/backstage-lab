# Gerado pelo template "Fila SQS" do Atlas.
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
    recurso    = "sqs"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/sqs/aws"
  version = "4.2.1"

  name                                   = local.name
  fifo_queue                             = ${{ values.fifo }}
  visibility_timeout_seconds             = ${{ values.visibilityTimeout }}
  create_dlq                             = true
  redrive_policy                         = { maxReceiveCount = ${{ values.maxReceiveCount }} }

  tags = local.tags
}
