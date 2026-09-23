variable "squad" {
  description = "Squad dona do recurso"
  type        = string
  default     = "${{ values.squad | replace("group:default/", "") }}"
}

variable "nome" {
  description = "Nome do recurso"
  type        = string
  default     = "${{ values.nome }}"
}

variable "ambiente" {
  description = "dev, hml ou prd"
  type        = string
  default     = "${{ values.ambiente }}"
}

variable "regiao" {
  description = "Região da AWS"
  type        = string
  default     = "us-east-1"
}
