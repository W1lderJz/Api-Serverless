variable "aws_region" {
  description = "Región AWS para todos los recursos"
  type        = string
  default     = "us-east-1"
}

variable "lambda_function_name" {
  description = "Nombre de la función Lambda"
  type        = string
  default     = "api-usuarios"
}

variable "s3_uploads_bucket" {
  description = "Nombre del bucket S3 para uploads (debe ser globalmente único)"
  type        = string
}

variable "database_url" {
  description = "URL de conexión a Neon PostgreSQL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Clave secreta para firmar tokens JWT"
  type        = string
  sensitive   = true
}

variable "lambda_zip_path" {
  description = "Ruta local al archivo ZIP del binario Lambda"
  type        = string
  default     = "../lambda.zip"
}

variable "log_retention_days" {
  description = "Días de retención de logs en CloudWatch"
  type        = number
  default     = 7
}
