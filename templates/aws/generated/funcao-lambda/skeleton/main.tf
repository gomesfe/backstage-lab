# Gerado pelo template "Função Lambda" do Atlas.
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
    recurso    = "funcao-lambda"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "7.7.1"

  function_name                          = local.name
  runtime                                = "${{ values.runtime }}"
  handler                                = "${{ values.handler }}"
  memory_size                            = ${{ values.memorySize }}
  timeout                                = ${{ values.timeout }}
  create_package                         = false
  local_existing_package                 = "./dist/function.zip"

  tags = local.tags
}
