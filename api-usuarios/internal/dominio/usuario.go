package dominio

import (
	"errors"
	"time"
)

type Usuario struct {
	ID        int
	Nombre    string
	Email     string
	Password  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type RepositorioUsuario interface {
	Crear(u *Usuario) (*Usuario, error)
	Listar() ([]*Usuario, error)
	BuscarPorID(id int) (*Usuario, error)
	BuscarPorEmail(email string) (*Usuario, error)
	Actualizar(u *Usuario) (*Usuario, error)
	Eliminar(id int) error
}

var (
	ErrEmailDuplicado = errors.New("email ya registrado")
	ErrNoEncontrado   = errors.New("usuario no encontrado")
	ErrCredenciales   = errors.New("credenciales inválidas")
)
