# Gerado pelo template "Banco relacional RDS" do Atlas.
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
    recurso    = "rds"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.10.0"

  identifier                             = local.name
  engine                                 = "${{ values.engine }}"
  engine_version                         = "${{ values.engineVersion }}"
  instance_class                         = "${{ values.instanceClass }}"
  allocated_storage                      = ${{ values.allocatedStorage }}
  multi_az                               = ${{ values.multiAz }}
  db_name                                = replace(local.name, "-", "_")
  manage_master_user_password            = true
  skip_final_snapshot                    = var.ambiente != "prd"
  deletion_protection                    = var.ambiente == "prd"

  tags = local.tags
}
