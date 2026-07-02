import { TicketStatus } from '../enums/ticket-status';

export type BackendTicketEstado =
  | 'EnAnalisis'
  | 'EnProceso'
  | 'Bloqueado'
  | 'Entregado'
  | 'DespliegueApitesting'
  | 'EnRevisionApitesting'
  | 'AprobadoApitesting'
  | 'DespligueQA'
  | 'EnRevisionQA'
  | 'AprobadoQA'
  | 'PendienteCertificacion'
  | 'Certificado'
  | 'DespliegueProduccion'
  | 'BUG'
  | 'Rollback';

export interface TicketHistoryDto {
  estadoOrigen: BackendTicketEstado;
  estadoDestino: BackendTicketEstado;
  idUsuarioAccion?: number | null;
  comentario?: string | null;
  fechaAccion: string;
}

export interface TicketDto {
  idTicket: string;
  idCaso: string;
  titulo: string;
  descripcion: string;
  ticketEstado: BackendTicketEstado;
  origen: 'SAIA' | 'GLPI';
  idUsuarioAsignado: number | null;
  causaRaiz?: string | null;
  solucionPropuesta?: string | null;
  fechaCreacion: string;
  fechaUltimaActualizacion?: string | null;
  comentarios: TicketHistoryDto[];
}

export interface CrearTicketRequestBody {
  codigoCaso: string;
  origenTicket: 1 | 2;
  titulo: string;
  descripcion: string;
  idUsuarioAsignado: number;
}

export interface ActualizarTicketRequestBody {
  titulo?: string | null;
  descripcion?: string | null;
  nuevoEstado?: BackendTicketEstado | null;
  idUsuarioAsignado?: number | null;
  causaRaiz?: string | null;
  solucionPropuesta?: string | null;
  comentario?: string | null;
}

export function ticketStatusToBackend(status: TicketStatus): BackendTicketEstado {
  const statuses: Record<TicketStatus, BackendTicketEstado> = {
    [TicketStatus.EN_ANALISIS]: 'EnAnalisis',
    [TicketStatus.EN_PROCESO]: 'EnProceso',
    [TicketStatus.BLOQUEO]: 'Bloqueado',
    [TicketStatus.ENTREGADO_A_LT]: 'Entregado',
    [TicketStatus.DESPLIEGUE_A_DESARROLLO]: 'DespliegueApitesting',
    [TicketStatus.EN_REVISION_DESARROLLO]: 'EnRevisionApitesting',
    [TicketStatus.APROBADO_PARA_QA]: 'AprobadoApitesting',
    [TicketStatus.DESPLIEGUE_A_QA]: 'DespligueQA',
    [TicketStatus.EN_REVISION_QA]: 'EnRevisionQA',
    [TicketStatus.PENDIENTE_CERTIFICACION]: 'PendienteCertificacion',
    [TicketStatus.CERTIFICADO]: 'Certificado',
    [TicketStatus.DESPLIEGUE_A_PRODUCCION]: 'DespliegueProduccion',
    [TicketStatus.FINALIZADO]: 'Certificado',
    [TicketStatus.DEVUELTO]: 'BUG',
    [TicketStatus.ROLLBACK]: 'Rollback',
  };
  return statuses[status] ?? 'EnAnalisis';
}
