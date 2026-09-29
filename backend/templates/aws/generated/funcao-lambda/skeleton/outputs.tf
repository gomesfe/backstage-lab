output "id" {
  description = "Identificador do recurso na AWS"
  value       = try(module.this.id, null)
}

output "arn" {
  description = "ARN do recurso"
  value       = try(module.this.arn, null)
}
