package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/ses/types"
)

type MensajeNotificacion struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func handler(ctx context.Context, event events.SQSEvent) error {
	fromEmail := os.Getenv("SES_FROM_EMAIL")
	region := os.Getenv("APP_REGION")
	if region == "" {
		region = "us-east-1"
	}

	cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	if err != nil {
		return fmt.Errorf("error cargando config AWS: %w", err)
	}

	sesClient := ses.NewFromConfig(cfg)

	for _, record := range event.Records {
		var snsWrapper struct {
			Message string `json:"Message"`
		}
		if err := json.Unmarshal([]byte(record.Body), &snsWrapper); err != nil {
			log.Printf("Error parseando wrapper SNS: %v", err)
			continue
		}

		var msg MensajeNotificacion
		if err := json.Unmarshal([]byte(snsWrapper.Message), &msg); err != nil {
			log.Printf("Error parseando mensaje: %v", err)
			continue
		}

		input := &ses.SendEmailInput{
			Source: aws.String(fromEmail),
			Destination: &types.Destination{
				ToAddresses: []string{msg.Email},
			},
			Message: &types.Message{
				Subject: &types.Content{
					Data:    aws.String(msg.Subject),
					Charset: aws.String("UTF-8"),
				},
				Body: &types.Body{
					Text: &types.Content{
						Data:    aws.String(msg.Message),
						Charset: aws.String("UTF-8"),
					},
				},
			},
		}

		_, err := sesClient.SendEmail(ctx, input)
		if err != nil {
			log.Printf("Error enviando email a %s: %v", msg.Email, err)
			continue
		}

		log.Printf("Email enviado exitosamente a %s", msg.Email)
	}

	return nil
}

func main() {
	lambda.Start(handler)
}
