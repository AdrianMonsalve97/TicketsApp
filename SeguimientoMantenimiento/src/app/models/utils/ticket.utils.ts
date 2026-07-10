import { Ticket } from '../interfaces/ticket.model';

/**
 * Verifica si el ticket tiene fuga de información (falta de historia de usuario vinculada).
 */
export function tieneFugaInformacion(ticket: Ticket | null | any): boolean {
  if (!ticket) return false;
  return !(ticket.nombreHu ?? ticket.historiaUsuario)?.trim();
}
