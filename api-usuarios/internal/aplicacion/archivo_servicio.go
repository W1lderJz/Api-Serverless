package aplicacion

import (
	"fmt"
	"path/filepath"

	"api-usuarios/internal/dominio"

	"github.com/google/uuid"
)

type ArchivoServicio struct {
	repo dominio.RepositorioArchivo
}

func NuevoArchivoServicio(repo dominio.RepositorioArchivo) *ArchivoServicio {
	return &ArchivoServicio{repo: repo}
}

func (s *ArchivoServicio) SubirArchivo(nombreOriginal, tipoMIME string, tamano int64, datos []byte) (string, error) {
	if tamano > dominio.TamanoMaxBytes {
		return "", dominio.ErrTamanoExcedido
	}
	if !dominio.TiposMIMEPermitidos[tipoMIME] {
		return "", dominio.ErrTipoNoPermitido
	}
	ext := filepath.Ext(nombreOriginal)
	nombreUnico := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	archivo := &dominio.Archivo{
		NombreOriginal: nombreOriginal,
		NombreUnico:    nombreUnico,
		TipoMIME:       tipoMIME,
		Tamano:         tamano,
	}
	return s.repo.Guardar(archivo, datos)
}

func (s *ArchivoServicio) ObtenerArchivo(nombre string) ([]byte, error) {
	return s.repo.Obtener(nombre)
}
