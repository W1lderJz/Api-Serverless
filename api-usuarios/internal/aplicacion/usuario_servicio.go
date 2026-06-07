package aplicacion

import (
	"os"
	"time"

	"api-usuarios/internal/dominio"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

type UsuarioServicio struct {
	repo dominio.RepositorioUsuario
}

func NuevoUsuarioServicio(repo dominio.RepositorioUsuario) *UsuarioServicio {
	return &UsuarioServicio{repo: repo}
}

func (s *UsuarioServicio) Registrar(nombre, email, password string) (*dominio.Usuario, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return nil, err
	}
	usuario := &dominio.Usuario{
		Nombre:   nombre,
		Email:    email,
		Password: string(hash),
	}
	return s.repo.Crear(usuario)
}

func (s *UsuarioServicio) Login(email, password string) (string, error) {
	usuario, err := s.repo.BuscarPorEmail(email)
	if err != nil {
		return "", dominio.ErrCredenciales
	}
	if err := bcrypt.CompareHashAndPassword([]byte(usuario.Password), []byte(password)); err != nil {
		return "", dominio.ErrCredenciales
	}
	c := claims{
		UserID: usuario.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func (s *UsuarioServicio) Listar() ([]*dominio.Usuario, error) {
	return s.repo.Listar()
}

func (s *UsuarioServicio) ObtenerPorID(id int) (*dominio.Usuario, error) {
	return s.repo.BuscarPorID(id)
}

func (s *UsuarioServicio) Actualizar(id int, nombre, email, password string) (*dominio.Usuario, error) {
	usuario, err := s.repo.BuscarPorID(id)
	if err != nil {
		return nil, err
	}
	if nombre != "" {
		usuario.Nombre = nombre
	}
	if email != "" {
		usuario.Email = email
	}
	if password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
		if err != nil {
			return nil, err
		}
		usuario.Password = string(hash)
	}
	return s.repo.Actualizar(usuario)
}

func (s *UsuarioServicio) Eliminar(id int) error {
	return s.repo.Eliminar(id)
}
