package http

import (
	"errors"
	"strconv"
	"time"

	"api-usuarios/internal/aplicacion"
	"api-usuarios/internal/dominio"

	"github.com/gin-gonic/gin"
)

type peticionRegistro struct {
	Nombre   string `json:"nombre"   binding:"required"`
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

type peticionLogin struct {
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

type peticionActualizar struct {
	Nombre   string `json:"nombre"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type respuestaUsuario struct {
	ID        int       `json:"id"`
	Nombre    string    `json:"nombre"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func aRespuesta(u *dominio.Usuario) respuestaUsuario {
	return respuestaUsuario{
		ID:        u.ID,
		Nombre:    u.Nombre,
		Email:     u.Email,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

type UsuarioManejador struct {
	servicio *aplicacion.UsuarioServicio
}

func NuevoUsuarioManejador(servicio *aplicacion.UsuarioServicio) *UsuarioManejador {
	return &UsuarioManejador{servicio: servicio}
}

func (m *UsuarioManejador) RegistrarRutas(router *gin.Engine, mw *MiddlewareJWT) {
	router.POST("/auth/registro", m.Registro)
	router.POST("/auth/login", m.Login)

	grupo := router.Group("/usuarios", mw.Verificar())
	grupo.GET("", m.Listar)
	grupo.GET("/:id", m.ObtenerPorID)
	grupo.PUT("/:id", m.Actualizar)
	grupo.DELETE("/:id", m.Eliminar)
}

func (m *UsuarioManejador) Registro(c *gin.Context) {
	var p peticionRegistro
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	usuario, err := m.servicio.Registrar(p.Nombre, p.Email, p.Password)
	if err != nil {
		if errors.Is(err, dominio.ErrEmailDuplicado) {
			c.JSON(409, gin.H{"error": err.Error()})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, aRespuesta(usuario))
}

func (m *UsuarioManejador) Login(c *gin.Context) {
	var p peticionLogin
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	token, err := m.servicio.Login(p.Email, p.Password)
	if err != nil {
		if errors.Is(err, dominio.ErrCredenciales) {
			c.JSON(401, gin.H{"error": err.Error()})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"token": token})
}

func (m *UsuarioManejador) Listar(c *gin.Context) {
	usuarios, err := m.servicio.Listar()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	lista := make([]respuestaUsuario, 0, len(usuarios))
	for _, u := range usuarios {
		lista = append(lista, aRespuesta(u))
	}

	c.JSON(200, lista)
}

func (m *UsuarioManejador) ObtenerPorID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "id inválido"})
		return
	}

	usuario, err := m.servicio.ObtenerPorID(id)
	if err != nil {
		if errors.Is(err, dominio.ErrNoEncontrado) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, aRespuesta(usuario))
}

func (m *UsuarioManejador) Actualizar(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "id inválido"})
		return
	}

	var p peticionActualizar
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	usuario, err := m.servicio.Actualizar(id, p.Nombre, p.Email, p.Password)
	if err != nil {
		if errors.Is(err, dominio.ErrNoEncontrado) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, dominio.ErrEmailDuplicado) {
			c.JSON(409, gin.H{"error": err.Error()})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, aRespuesta(usuario))
}

func (m *UsuarioManejador) Eliminar(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "id inválido"})
		return
	}

	if err := m.servicio.Eliminar(id); err != nil {
		if errors.Is(err, dominio.ErrNoEncontrado) {
			c.JSON(404, gin.H{"error": err.Error()})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"mensaje": "usuario eliminado"})
}
