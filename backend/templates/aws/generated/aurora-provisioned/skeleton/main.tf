# Gerado pelo template "Aurora com capacidade provisionada" do Atlas.
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
    recurso    = "aurora-provisioned"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "9.10.0"

  name                                   = local.name
  engine                                 = "${{ values.engine }}"
  instances                              = { for i in range(${{ values.instances }}) : tostring(i) => { instance_class = "${{ values.instanceClass }}" } }
  manage_master_user_password            = true
  skip_final_snapshot                    = var.ambiente != "prd"

  tags = local.tags
}
