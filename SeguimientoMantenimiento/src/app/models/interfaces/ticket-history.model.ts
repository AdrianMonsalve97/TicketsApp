import { TicketStatus } from '../enums/ticket-status';

export interface TicketHistory {
  idHistorico: string;
  idTicket: string;
  idEstadoOrigen?: TicketStatus;
  idEstadoDestino: TicketStatus;
  idUsuarioAccion: string;
  fechaCambio: Date;
  Comentario?: string;
}
