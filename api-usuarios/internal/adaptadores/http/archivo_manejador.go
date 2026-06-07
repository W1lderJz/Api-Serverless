package http

import (
	"errors"
	"io"
	"net/http"

	"api-usuarios/internal/aplicacion"
	"api-usuarios/internal/dominio"

	"github.com/gin-gonic/gin"
)

type ArchivoManejador struct {
	servicio *aplicacion.ArchivoServicio
}

func NuevoArchivoManejador(servicio *aplicacion.ArchivoServicio) *ArchivoManejador {
	return &ArchivoManejador{servicio: servicio}
}

func (m *ArchivoManejador) RegistrarRutas(router *gin.Engine, mw *MiddlewareJWT) {
	router.POST("/upload", mw.Verificar(), m.SubirArchivo)
	router.GET("/uploads/:nombre", m.ObtenerArchivo)
}

func (m *ArchivoManejador) SubirArchivo(c *gin.Context) {
	archivoHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": dominio.ErrCampoFileRequerido.Error()})
		return
	}
	f, err := archivoHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error al leer el archivo"})
		return
	}
	defer f.Close()
	datos, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "error al procesar el archivo"})
		return
	}
	tipoMIME := archivoHeader.Header.Get("Content-Type")
	nombreUnico, err := m.servicio.SubirArchivo(archivoHeader.Filename, tipoMIME, archivoHeader.Size, datos)
	if err != nil {
		switch {
		case errors.Is(err, dominio.ErrTamanoExcedido):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, dominio.ErrTipoNoPermitido):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": nombreUnico})
}

func (m *ArchivoManejador) ObtenerArchivo(c *gin.Context) {
	nombre := c.Param("nombre")
	datos, err := m.servicio.ObtenerArchivo(nombre)
	if err != nil {
		if errors.Is(err, dominio.ErrArchivoNoEncontrado) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Data(http.StatusOK, "application/octet-stream", datos)
}
