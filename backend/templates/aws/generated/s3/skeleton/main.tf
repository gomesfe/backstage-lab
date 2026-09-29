# Gerado pelo template "Bucket S3" do Atlas.
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
    recurso    = "s3"
    origem     = "atlas"
    repositorio = "${{ values.repoUrl | parseRepoUrl | pick("repo") }}"
  }
}

module "this" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "4.2.2"

  bucket                                 = local.name
  force_destroy                          = var.ambiente != "prd"
  versioning                             = { enabled = ${{ values.versioning }} }
  block_public_acls                      = true
  block_public_policy                    = true
  ignore_public_acls                     = true
  restrict_public_buckets                = true
  server_side_encryption_configuration   = { rule = { apply_server_side_encryption_by_default = { sse_algorithm = "AES256" } } }

  tags = local.tags
}
