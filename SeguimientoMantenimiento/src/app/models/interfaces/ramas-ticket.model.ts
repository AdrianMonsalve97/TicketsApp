import { Ticket } from './ticket.model';
import { RamasModel } from './ramas.model';

export interface RamasTicketModel {
  idRamaTicket: string;
  idTicket: Ticket;
  idRama: RamasModel;
  fechaAsignacion: Date;
}
