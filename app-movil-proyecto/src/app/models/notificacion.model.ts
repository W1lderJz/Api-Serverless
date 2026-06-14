export interface NotificacionRequest {
  email: string;
  subject: string;
  message: string;
}

export interface NotificacionResponse {
  mensaje: string;
}
