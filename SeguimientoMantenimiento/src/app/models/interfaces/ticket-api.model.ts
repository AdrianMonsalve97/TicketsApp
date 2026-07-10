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

export type BackendTicketOrigen = 'SAIA' | 'GLPI';

export interface TicketHistoryDto {
  estadoOrigen: BackendTicketEstado | 0 | null;
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
  origen: BackendTicketOrigen;
  idUsuarioAsignado: number | null;
  causaRaiz?: string | null;
  solucionPropuesta?: string | null;
  esDesarrollo: boolean;
  nombreHu?: string | null;
  urlHu?: string | null;
  carpetaMedios?: string | null;
  fechaCreacion: string;
  fechaUltimaActualizacion?: string | null;
  activo: boolean;
  fechaEliminacion?: string | null;
  comentarios: TicketHistoryDto[];
}

export interface CrearTicketRequestBody {
  codigoCaso: string;
  origenTicket: BackendTicketOrigen | 1 | 2;
  titulo: string;
  descripcion: string;
  idUsuarioAsignado: number;
  esDesarrollo?: boolean;
}

export interface ActualizarTicketRequestBody {
  titulo?: string | null;
  descripcion?: string | null;
  nuevoEstado?: BackendTicketEstado | null;
  idUsuarioAsignado?: number | null;
  causaRaiz?: string | null;
  solucionPropuesta?: string | null;
  comentario?: string | null;
  esDesarrollo?: boolean | null;
  nombreHu?: string | null;
  urlHu?: string | null;
  carpetaMedios?: string | null;
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
    [TicketStatus.APROBADO_QA]: 'AprobadoQA',
    [TicketStatus.PENDIENTE_CERTIFICACION]: 'PendienteCertificacion',
    [TicketStatus.CERTIFICADO]: 'Certificado',
    [TicketStatus.DESPLIEGUE_A_PRODUCCION]: 'DespliegueProduccion',
    [TicketStatus.FINALIZADO]: 'Certificado',
    [TicketStatus.DEVUELTO]: 'BUG',
    [TicketStatus.ROLLBACK]: 'Rollback',
  };
  return statuses[status] ?? 'EnAnalisis';
}

export function ticketStatusFromBackend(status: BackendTicketEstado | 0 | null | undefined): TicketStatus {
  const statuses: Record<BackendTicketEstado, TicketStatus> = {
    EnAnalisis: TicketStatus.EN_ANALISIS,
    EnProceso: TicketStatus.EN_PROCESO,
    Bloqueado: TicketStatus.BLOQUEO,
    Entregado: TicketStatus.ENTREGADO_A_LT,
    DespliegueApitesting: TicketStatus.DESPLIEGUE_A_DESARROLLO,
    EnRevisionApitesting: TicketStatus.EN_REVISION_DESARROLLO,
    AprobadoApitesting: TicketStatus.APROBADO_PARA_QA,
    DespligueQA: TicketStatus.DESPLIEGUE_A_QA,
    EnRevisionQA: TicketStatus.EN_REVISION_QA,
    AprobadoQA: TicketStatus.APROBADO_QA,
    PendienteCertificacion: TicketStatus.PENDIENTE_CERTIFICACION,
    Certificado: TicketStatus.CERTIFICADO,
    DespliegueProduccion: TicketStatus.DESPLIEGUE_A_PRODUCCION,
    BUG: TicketStatus.DEVUELTO,
    Rollback: TicketStatus.ROLLBACK,
  };
  return status ? statuses[status as BackendTicketEstado] ?? TicketStatus.EN_ANALISIS : TicketStatus.EN_ANALISIS;
}
