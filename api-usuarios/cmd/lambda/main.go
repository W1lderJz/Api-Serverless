package main

import (
	"context"
	"database/sql"
	"log"
	"os"

	adaptadoreshttp "api-usuarios/internal/adaptadores/http"
	s3adaptador "api-usuarios/internal/adaptadores/s3"
	"api-usuarios/internal/adaptadores/postgres"
	"api-usuarios/internal/aplicacion"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var ginLambda *ginadapter.GinLambda

func init() {
	databaseURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")
	s3Bucket := os.Getenv("S3_BUCKET")
	appRegion := os.Getenv("APP_REGION")

	if databaseURL == "" || jwtSecret == "" || s3Bucket == "" {
		log.Fatal("DATABASE_URL, JWT_SECRET y S3_BUCKET son requeridos")
	}
	if appRegion == "" {
		appRegion = "us-east-1"
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Error abriendo DB: %v", err)
	}
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(2)

	usuarioRepo := postgres.NuevoUsuarioRepositorio(db)
	usuarioServicio := aplicacion.NuevoUsuarioServicio(usuarioRepo)

	archivoRepo, err := s3adaptador.NuevoS3ArchivoRepositorio(s3Bucket, appRegion)
	if err != nil {
		log.Fatalf("Error inicializando S3: %v", err)
	}
	archivoServicio := aplicacion.NuevoArchivoServicio(archivoRepo)

	middleware := adaptadoreshttp.NuevoMiddlewareJWT(jwtSecret)
	usuarioManejador := adaptadoreshttp.NuevoUsuarioManejador(usuarioServicio)
	archivoManejador := adaptadoreshttp.NuevoArchivoManejador(archivoServicio)

	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	usuarioManejador.RegistrarRutas(router, middleware)
	archivoManejador.RegistrarRutas(router, middleware)

	ginLambda = ginadapter.New(router)
}

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if req.HTTPMethod == "OPTIONS" {
		return events.APIGatewayProxyResponse{
			StatusCode: 204,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		}, nil
	}
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
