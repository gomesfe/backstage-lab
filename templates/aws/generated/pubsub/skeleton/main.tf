# Gerado pelo template "Pub/Sub (SNS + SQS)" do Atlas.
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
    recurso    = "pubsub"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/sns/aws"
  version = "6.1.2"

  name                                   = local.name
  subscriptions                          = { fila = { protocol = "sqs", endpoint = module.fila.queue_arn, raw_message_delivery = ${{ values.rawMessageDelivery }} } }

  tags = local.tags
}

module "fila" {
  source  = "terraform-aws-modules/sqs/aws"
  version = "4.2.1"

  name       = "${local.name}-${{ values.subscriberQueue }}"
  create_dlq = true

  tags = local.tags
}
