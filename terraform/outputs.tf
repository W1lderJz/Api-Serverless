output "api_gateway_url" {
  description = "URL base del API Gateway"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda principal"
  value       = aws_lambda_function.api_usuarios.function_name
}

output "s3_bucket_name" {
  description = "Nombre del bucket S3 para uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "lambda_arn" {
  description = "ARN de la función Lambda principal"
  value       = aws_lambda_function.api_usuarios.arn
}

output "sns_topic_arn" {
  description = "ARN del SNS Topic de notificaciones"
  value       = aws_sns_topic.notificaciones.arn
}

output "sqs_queue_url" {
  description = "URL de la cola SQS de notificaciones"
  value       = aws_sqs_queue.notificaciones.id
}

output "notification_lambda_name" {
  description = "Nombre de la Lambda de notificaciones"
  value       = aws_lambda_function.notification_lambda.function_name
}
