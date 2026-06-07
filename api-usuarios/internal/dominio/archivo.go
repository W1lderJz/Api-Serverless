package dominio

import "errors"

type Archivo struct {
	NombreOriginal string
	NombreUnico    string
	TipoMIME       string
	Tamano         int64
	Ruta           string
}

type RepositorioArchivo interface {
	Guardar(archivo *Archivo, datos []byte) (string, error)
	Obtener(nombre string) ([]byte, error)
}

var (
	ErrArchivoNoEncontrado = errors.New("archivo no encontrado")
	ErrTipoNoPermitido     = errors.New("tipo de archivo no permitido")
	ErrTamanoExcedido      = errors.New("el archivo excede el tamaño máximo permitido")
	ErrCampoFileRequerido  = errors.New("el campo 'file' es requerido en el formulario")
)

var TiposMIMEPermitidos = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"application/pdf": true,
	"text/plain":      true,
}

const TamanoMaxBytes = 10 * 1024 * 1024
