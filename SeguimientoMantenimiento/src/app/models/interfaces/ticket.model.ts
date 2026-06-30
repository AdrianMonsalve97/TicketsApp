import { TicketStatus } from '../enums/ticket-status';
import { Repository } from './repository.model';
import { TicketHistory } from './ticket-history.model';

export interface Ticket {
  idTicket: string;
  codigoCaso: string;
  titulo: string;
  descripcion: string;
  estadoActual: TicketStatus;
  idUsuarioAsignado: number;

  desarrolladorAsignadoId?: string;
  qaAsignadoId?: string;
  ltAsignadoId?: string;
  historiaUsuario?: string;

  fechaAsignacion: Date;
  fechaCreacion?: Date;
  fechaUltimaActualizacion: Date;

  carpetaMedios?: string;
  causaRaiz?: string;
  solucionPropuesta?: string;

  repositoriosAfectados: Repository[];
  historial: TicketHistory[];
}
