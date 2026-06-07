resource "aws_iam_role" "lambda_exec" {
  name = "${var.lambda_function_name}-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_s3" {
  name = "lambda-s3-uploads"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      Resource = [
        aws_s3_bucket.uploads.arn,
        "${aws_s3_bucket.uploads.arn}/*"
      ]
    }]
  })
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_s3_bucket" "uploads" {
  bucket        = var.s3_uploads_bucket
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_lambda_function" "api_usuarios" {
  function_name = var.lambda_function_name
  filename      = var.lambda_zip_path
  runtime       = "provided.al2023"
  handler       = "bootstrap"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 30
  memory_size   = 256

  source_code_hash = filebase64sha256(var.lambda_zip_path)

  environment {
    variables = {
      DATABASE_URL = var.database_url
      JWT_SECRET   = var.jwt_secret
      S3_BUCKET    = aws_s3_bucket.uploads.bucket
      APP_REGION   = var.aws_region
      GIN_MODE     = "release"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy_attachment.lambda_basic,
  ]
}

resource "aws_apigatewayv2_api" "api_gw" {
  name          = "${var.lambda_function_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.api_gw.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lambda_logs.arn
    format          = "$context.requestId $context.status $context.routeKey $context.integrationErrorMessage"
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.api_gw.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_usuarios.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "proxy_route" {
  api_id    = aws_apigatewayv2_api.api_gw.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "root_route" {
  api_id    = aws_apigatewayv2_api.api_gw.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_usuarios.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api_gw.execution_arn}/*/*"
}
