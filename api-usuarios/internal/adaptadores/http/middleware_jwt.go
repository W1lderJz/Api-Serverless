package http

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type MiddlewareJWT struct {
	clave string
}

func NuevoMiddlewareJWT(clave string) *MiddlewareJWT {
	return &MiddlewareJWT{clave: clave}
}

type claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

func (mw *MiddlewareJWT) Verificar() gin.HandlerFunc {
	return func(c *gin.Context) {
		encabezado := c.GetHeader("Authorization")
		if encabezado == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "token requerido"})
			return
		}

		if !strings.HasPrefix(encabezado, "Bearer ") {
			c.AbortWithStatusJSON(401, gin.H{"error": "formato de token inválido"})
			return
		}

		tokenStr := strings.TrimPrefix(encabezado, "Bearer ")

		cl := &claims{}
		token, err := jwt.ParseWithClaims(tokenStr, cl, func(t *jwt.Token) (interface{}, error) {
			return []byte(mw.clave), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"error": "token inválido o expirado"})
			return
		}

		c.Set("userID", cl.UserID)
		c.Next()
	}
}
