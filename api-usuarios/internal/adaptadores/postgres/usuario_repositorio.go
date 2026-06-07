package postgres

import (
	"database/sql"

	"api-usuarios/internal/dominio"
	"github.com/lib/pq"
)

type UsuarioRepositorio struct {
	db *sql.DB
}

func NuevoUsuarioRepositorio(db *sql.DB) *UsuarioRepositorio {
	return &UsuarioRepositorio{db: db}
}

func (r *UsuarioRepositorio) Crear(u *dominio.Usuario) (*dominio.Usuario, error) {
	query := `INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, password, created_at, updated_at`
	creado := &dominio.Usuario{}
	err := r.db.QueryRow(query, u.Nombre, u.Email, u.Password).Scan(
		&creado.ID,
		&creado.Nombre,
		&creado.Email,
		&creado.Password,
		&creado.CreatedAt,
		&creado.UpdatedAt,
	)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return nil, dominio.ErrEmailDuplicado
		}
		return nil, err
	}
	return creado, nil
}

func (r *UsuarioRepositorio) Listar() ([]*dominio.Usuario, error) {
	query := `SELECT id, nombre, email, password, created_at, updated_at FROM usuarios ORDER BY id`
	filas, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer filas.Close()

	var usuarios []*dominio.Usuario
	for filas.Next() {
		u := &dominio.Usuario{}
		if err := filas.Scan(&u.ID, &u.Nombre, &u.Email, &u.Password, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		usuarios = append(usuarios, u)
	}
	if err := filas.Err(); err != nil {
		return nil, err
	}
	return usuarios, nil
}

func (r *UsuarioRepositorio) BuscarPorID(id int) (*dominio.Usuario, error) {
	query := `SELECT id, nombre, email, password, created_at, updated_at FROM usuarios WHERE id = $1`
	u := &dominio.Usuario{}
	err := r.db.QueryRow(query, id).Scan(&u.ID, &u.Nombre, &u.Email, &u.Password, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, dominio.ErrNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UsuarioRepositorio) BuscarPorEmail(email string) (*dominio.Usuario, error) {
	query := `SELECT id, nombre, email, password, created_at, updated_at FROM usuarios WHERE email = $1`
	u := &dominio.Usuario{}
	err := r.db.QueryRow(query, email).Scan(&u.ID, &u.Nombre, &u.Email, &u.Password, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, dominio.ErrNoEncontrado
	}
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UsuarioRepositorio) Actualizar(u *dominio.Usuario) (*dominio.Usuario, error) {
	query := `UPDATE usuarios SET nombre=$1, email=$2, password=$3, updated_at=NOW() WHERE id=$4 RETURNING id, nombre, email, password, created_at, updated_at`
	actualizado := &dominio.Usuario{}
	err := r.db.QueryRow(query, u.Nombre, u.Email, u.Password, u.ID).Scan(
		&actualizado.ID,
		&actualizado.Nombre,
		&actualizado.Email,
		&actualizado.Password,
		&actualizado.CreatedAt,
		&actualizado.UpdatedAt,
	)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return nil, dominio.ErrEmailDuplicado
		}
		if err == sql.ErrNoRows {
			return nil, dominio.ErrNoEncontrado
		}
		return nil, err
	}
	return actualizado, nil
}

func (r *UsuarioRepositorio) Eliminar(id int) error {
	query := `DELETE FROM usuarios WHERE id = $1`
	resultado, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	afectadas, err := resultado.RowsAffected()
	if err != nil {
		return err
	}
	if afectadas == 0 {
		return dominio.ErrNoEncontrado
	}
	return nil
}
