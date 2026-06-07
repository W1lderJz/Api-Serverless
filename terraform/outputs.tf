output "api_gateway_url" {
  description = "URL base del API Gateway (úsala en la app móvil en lugar de http://localhost:8080)"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda desplegada"
  value       = aws_lambda_function.api_usuarios.function_name
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 para uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "lambda_arn" {
  description = "ARN de la función Lambda"
  value       = aws_lambda_function.api_usuarios.arn
}
