import { Ticket } from './ticket.model';
import { RamasModel } from './ramas.model';

export interface RamasTicketModel {
  idRamaTicket: string;
  idTicket: string;
  idRama: string;
  fechaAsignacion: Date;
}
