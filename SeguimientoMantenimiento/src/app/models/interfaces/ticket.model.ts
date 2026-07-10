import { TicketStatus } from '../enums/ticket-status';
import { BackendTicketOrigen } from './ticket-api.model';
import { Repository } from './repository.model';
import { TicketHistory } from './ticket-history.model';


export interface Ticket {
  idTicket: string;
  codigoCaso: string;
  titulo: string;
  descripcion: string;
  estadoActual: TicketStatus;
  origenTicket?: BackendTicketOrigen;
  idUsuarioAsignado: number;

  desarrolladorAsignadoId?: string;
  desarrolladorAsignadoNombre?: string;
  qaAsignadoId?: string;
  ltAsignadoId?: string;
  ltAsignadoNombre?: string;
  historiaUsuario?: string;
  esDesarrollo?: boolean;
  nombreHu?: string;
  urlHu?: string;

  fechaAsignacion: Date;
  fechaCreacion?: Date;
  fechaUltimaActualizacion: Date;

  carpetaMedios?: string;
  causaRaiz?: string;
  solucionPropuesta?: string;
  activo?: boolean;
  fechaEliminacion?: Date | null;

  repositoriosAfectados: Repository[];
  historial: TicketHistory[];
}
