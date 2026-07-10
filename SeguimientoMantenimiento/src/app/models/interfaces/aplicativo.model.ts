export interface Aplicativo {
  idAplicativo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface AplicativoTicket {
  idAplicativoTicket: string;
  idTicket: string;
  idAplicativo: string;
  aplicativo: string;
  fechaAsignacion: Date;
}

export interface CrearAplicativoRequest {
  nombre: string;
  descripcion?: string | null;
}
