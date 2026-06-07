import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { AuthService } from '../services/auth.service';
import { RegistroRequest, Usuario } from '../models/usuario.model';

export interface DashboardData {
  usuarios: Usuario[];
  perfil: Usuario;
  configuracion: Usuario[];
}

@Injectable({ providedIn: 'root' })
export class UsuarioViewModel {

  private _usuarios$ = new BehaviorSubject<Usuario[]>([]);
  private _usuarioActual$ = new BehaviorSubject<Usuario | null>(null);
  private _cargando$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);
  private _cargandoDashboard$ = new BehaviorSubject<boolean>(false);
  private _dashboardData$ = new BehaviorSubject<DashboardData | null>(null);
  private _suscripcionDashboard?: Subscription;

  readonly usuarios$ = this._usuarios$.asObservable();
  readonly usuarioActual$ = this._usuarioActual$.asObservable();
  readonly cargando$ = this._cargando$.asObservable();
  readonly error$ = this._error$.asObservable();
  readonly cargandoDashboard$ = this._cargandoDashboard$.asObservable();
  readonly dashboardData$ = this._dashboardData$.asObservable();

  constructor(
    private usuarioRepo: UsuarioRepository,
    private authService: AuthService
  ) {}

  cargarUsuarios(): void {
    this._cargando$.next(true);
    this._error$.next(null);
    this.usuarioRepo.listar().subscribe({
      next: usuarios => { this._usuarios$.next(usuarios); this._cargando$.next(false); },
      error: err => { this._error$.next(err.message); this._cargando$.next(false); }
    });
  }

  cargarUsuarioPorId(id: number): void {
    this._cargando$.next(true);
    this._error$.next(null);
    this.usuarioRepo.obtenerPorId(id).subscribe({
      next: usuario => { this._usuarioActual$.next(usuario); this._cargando$.next(false); },
      error: err => { this._error$.next(err.message); this._cargando$.next(false); }
    });
  }

  crearUsuario(datos: RegistroRequest): void {
    this._cargando$.next(true);
    this._error$.next(null);
    this.usuarioRepo.crear(datos).subscribe({
      next: usuario => {
        this._usuarios$.next([...this._usuarios$.value, usuario]);
        this._cargando$.next(false);
      },
      error: err => { this._error$.next(err.message); this._cargando$.next(false); }
    });
  }

  actualizarUsuario(id: number, datos: Partial<RegistroRequest>): void {
    this._cargando$.next(true);
    this._error$.next(null);
    this.usuarioRepo.actualizar(id, datos).subscribe({
      next: actualizado => {
        this._usuarios$.next(this._usuarios$.value.map(u => u.id === id ? actualizado : u));
        this._cargando$.next(false);
      },
      error: err => { this._error$.next(err.message); this._cargando$.next(false); }
    });
  }

  eliminarUsuario(id: number): void {
    this._cargando$.next(true);
    this._error$.next(null);
    this.usuarioRepo.eliminar(id).subscribe({
      next: () => {
        this._usuarios$.next(this._usuarios$.value.filter(u => u.id !== id));
        this._cargando$.next(false);
      },
      error: err => { this._error$.next(err.message); this._cargando$.next(false); }
    });
  }

  cargarDashboard(usuarioId: number): void {
    this._cargandoDashboard$.next(true);
    this._error$.next(null);
    this._suscripcionDashboard = forkJoin({
      usuarios:      this.usuarioRepo.listar(),
      perfil:        this.usuarioRepo.obtenerPorId(usuarioId),
      configuracion: this.usuarioRepo.listar()
    }).subscribe({
      next: data => { this._dashboardData$.next(data); this._cargandoDashboard$.next(false); },
      error: err => { this._error$.next(err.message); this._cargandoDashboard$.next(false); }
    });
  }

  destruirDashboard(): void {
    this._suscripcionDashboard?.unsubscribe();
  }
}
