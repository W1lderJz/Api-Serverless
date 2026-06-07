import { Injectable } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ArchivoRepository } from '../repositories/archivo.repository';
import { EstadoArchivo } from '../models/archivo.model';

@Injectable({ providedIn: 'root' })
export class ArchivoViewModel {

  private _estado$ = new BehaviorSubject<EstadoArchivo>({
    progreso: 0, urlArchivo: null, error: null, cargando: false
  });

  readonly estado$ = this._estado$.asObservable();

  constructor(private archivoRepo: ArchivoRepository) {}

  subirArchivo(archivo: File): void {
    const errorValidacion = this.archivoRepo.validarArchivo(archivo);
    if (errorValidacion) {
      this._estado$.next({ progreso: 0, urlArchivo: null, error: errorValidacion, cargando: false });
      return;
    }

    this._estado$.next({ progreso: 0, urlArchivo: null, error: null, cargando: true });

    this.archivoRepo.subirArchivo(archivo).subscribe({
      next: evento => {
        if (evento.type === HttpEventType.UploadProgress && evento.total) {
          const progreso = Math.round(100 * evento.loaded / evento.total);
          this._estado$.next({ ...this._estado$.value, progreso });
        }
        if (evento.type === HttpEventType.Response) {
          this._estado$.next({
            progreso: 100,
            urlArchivo: (evento.body as any)?.url ?? null,
            error: null,
            cargando: false
          });
        }
      },
      error: err => {
        this._estado$.next({ progreso: 0, urlArchivo: null, error: err.message, cargando: false });
      }
    });
  }

  limpiar(): void {
    this._estado$.next({ progreso: 0, urlArchivo: null, error: null, cargando: false });
  }
}
