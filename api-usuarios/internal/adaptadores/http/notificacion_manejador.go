package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"github.com/gin-gonic/gin"
)

type peticionNotificacion struct {
	Email   string `json:"email"   binding:"required"`
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required"`
}

type NotificacionManejador struct {
	snsTopicARN string
	region      string
}

func NuevoNotificacionManejador() *NotificacionManejador {
	return &NotificacionManejador{
		snsTopicARN: os.Getenv("SNS_TOPIC_ARN"),
		region:      os.Getenv("APP_REGION"),
	}
}

func (m *NotificacionManejador) RegistrarRutas(router *gin.Engine, mw *MiddlewareJWT) {
	router.POST("/notifications/send", mw.Verificar(), m.Enviar)
}

func (m *NotificacionManejador) Enviar(c *gin.Context) {
	var p peticionNotificacion
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if m.snsTopicARN == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "SNS_TOPIC_ARN no configurado"})
		return
	}

	region := m.region
	if region == "" {
		region = "us-east-1"
	}

	cfg, err := awsconfig.LoadDefaultConfig(context.Background(), awsconfig.WithRegion(region))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error configurando AWS: %v", err)})
		return
	}

	datos := struct {
		Email   string `json:"email"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}{
		Email:   p.Email,
		Subject: p.Subject,
		Message: p.Message,
	}

	mensajeJSON, err := json.Marshal(datos)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error serializando mensaje"})
		return
	}

	snsClient := sns.NewFromConfig(cfg)
	_, err = snsClient.Publish(context.Background(), &sns.PublishInput{
		TopicArn: aws.String(m.snsTopicARN),
		Message:  aws.String(string(mensajeJSON)),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("error publicando en SNS: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Notificación enviada correctamente"})
}
