import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ArchivoService } from '../services/archivo.service';
import { ArchivoRespuesta } from '../models/archivo.model';

@Injectable({ providedIn: 'root' })
export class ArchivoRepository {

  private readonly TIPOS_PERMITIDOS = [
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'
  ];
  private readonly TAMANO_MAX_BYTES = 10 * 1024 * 1024;

  constructor(private archivoService: ArchivoService) {}

  validarArchivo(archivo: File): string | null {
    const tipoPermitido = this.TIPOS_PERMITIDOS.includes(archivo.type);
    const tamanoValido = archivo.size <= this.TAMANO_MAX_BYTES;
    if (!tipoPermitido || !tamanoValido) {
      return 'Archivo no válido: verifique el tipo y tamaño';
    }
    return null;
  }

  subirArchivo(archivo: File): Observable<HttpEvent<ArchivoRespuesta>> {
    return this.archivoService.subirArchivo(archivo).pipe(
      catchError(err => throwError(() => this.mapearError(err)))
    );
  }

  private mapearError(err: HttpErrorResponse | Error): Error {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return new Error('Error de conexión. Intente nuevamente');
      return new Error('Error al subir el archivo');
    }
    return new Error('Error de conexión. Intente nuevamente');
  }
}
