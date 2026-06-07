import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { RegistroRequest, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioRepository {

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  listar(): Observable<Usuario[]> {
    return this.usuarioService.listar().pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.usuarioService.obtenerPorId(id).pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  crear(datos: RegistroRequest): Observable<Usuario> {
    return this.authService.registro(datos).pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  actualizar(id: number, datos: Partial<RegistroRequest>): Observable<Usuario> {
    return this.usuarioService.actualizar(id, datos).pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  eliminar(id: number): Observable<void> {
    return this.usuarioService.eliminar(id).pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  private mapearError(err: HttpErrorResponse): Error {
    if (err.status === 404) return new Error('Usuario no encontrado');
    if (err.status === 409) return new Error('El email ya está en uso');
    return new Error('Error inesperado. Intente nuevamente');
  }
}
