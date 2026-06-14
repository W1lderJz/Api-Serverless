import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificacionRequest, NotificacionResponse } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {

  constructor(private http: HttpClient) {}

  enviar(req: NotificacionRequest): Observable<NotificacionResponse> {
    return this.http.post<NotificacionResponse>(`${environment.apiUrl}/notifications/send`, req);
  }
}
