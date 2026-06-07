package disco

import (
	"errors"
	"os"
	"path/filepath"

	"api-usuarios/internal/dominio"
)

type ArchivoRepositorio struct {
	directorioBase string
}

func NuevoArchivoRepositorio(directorioBase string) *ArchivoRepositorio {
	return &ArchivoRepositorio{directorioBase: directorioBase}
}

func (r *ArchivoRepositorio) Guardar(archivo *dominio.Archivo, datos []byte) (string, error) {
	if err := os.MkdirAll(r.directorioBase, 0755); err != nil {
		return "", err
	}
	rutaCompleta := filepath.Join(r.directorioBase, archivo.NombreUnico)
	if err := os.WriteFile(rutaCompleta, datos, 0644); err != nil {
		return "", err
	}
	return archivo.NombreUnico, nil
}

func (r *ArchivoRepositorio) Obtener(nombre string) ([]byte, error) {
	rutaCompleta := filepath.Join(r.directorioBase, nombre)
	datos, err := os.ReadFile(rutaCompleta)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, dominio.ErrArchivoNoEncontrado
		}
		return nil, err
	}
	return datos, nil
}
