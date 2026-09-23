# Gerado pelo template "Instância EC2" do Atlas.
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
    recurso    = "ec2"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "5.7.1"

  name                                   = local.name
  instance_type                          = "${{ values.instanceType }}"
  monitoring                             = true
  root_block_device                      = [{ volume_size = ${{ values.volumeSize }}, encrypted = true }]
  metadata_options                       = { http_tokens = "required" }

  tags = local.tags
}
