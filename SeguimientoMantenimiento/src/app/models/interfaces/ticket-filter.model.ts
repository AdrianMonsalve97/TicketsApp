import { TicketStatus } from '../enums/ticket-status';

export type TicketOrigen = 'SAIA' | 'GLPI';

export interface TicketFilter {
  pagina?: number;
  tamanoPagina?: number;
  estado?: TicketStatus;
  origen?: TicketOrigen;
  idUsuarioAsignado?: number;
  codigoCaso?: string;
  desde?: Date | string;
  hasta?: Date | string;
  incluirEliminados?: boolean;
}
