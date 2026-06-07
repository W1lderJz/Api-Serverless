export interface ArchivoRespuesta {
  url: string;
}

export interface EstadoArchivo {
  progreso: number;
  urlArchivo: string | null;
  error: string | null;
  cargando: boolean;
}
