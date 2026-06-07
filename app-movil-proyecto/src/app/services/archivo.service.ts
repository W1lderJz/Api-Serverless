import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ArchivoRespuesta } from '../models/archivo.model';

@Injectable({ providedIn: 'root' })
export class ArchivoService {

  constructor(private http: HttpClient) {}

  subirArchivo(archivo: File): Observable<HttpEvent<ArchivoRespuesta>> {
    const formData = new FormData();
    formData.append('file', archivo);
    return this.http.post<ArchivoRespuesta>(
      `${environment.apiUrl}/upload`,
      formData,
      { reportProgress: true, observe: 'events' }
    );
  }

  obtenerArchivo(nombre: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/uploads/${nombre}`, { responseType: 'blob' });
  }
}
