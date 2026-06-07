package main

import (
	"database/sql"
	"log"
	"os"

	adaptadoreshttp "api-usuarios/internal/adaptadores/http"
	"api-usuarios/internal/adaptadores/disco"
	"api-usuarios/internal/adaptadores/postgres"
	"api-usuarios/internal/aplicacion"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Archivo .env no encontrado, usando variables de entorno del sistema")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")

	if databaseURL == "" || jwtSecret == "" {
		log.Fatal("DATABASE_URL y JWT_SECRET son requeridos")
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	repo := postgres.NuevoUsuarioRepositorio(db)
	servicio := aplicacion.NuevoUsuarioServicio(repo)
	manejador := adaptadoreshttp.NuevoUsuarioManejador(servicio)
	middleware := adaptadoreshttp.NuevoMiddlewareJWT(jwtSecret)

	router := gin.Default()

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

	manejador.RegistrarRutas(router, middleware)

	uploadsDir := os.Getenv("UPLOADS_DIR")
	if uploadsDir == "" {
		uploadsDir = "./uploads"
	}

	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Fatal("Error al crear el directorio de uploads:", err)
	}

	archivoRepo := disco.NuevoArchivoRepositorio(uploadsDir)
	archivoServicio := aplicacion.NuevoArchivoServicio(archivoRepo)
	archivoManejador := adaptadoreshttp.NuevoArchivoManejador(archivoServicio)
	archivoManejador.RegistrarRutas(router, middleware)

	log.Println("Servidor iniciando en :8080")
	router.Run(":8080")
}
