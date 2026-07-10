import { TicketStatus } from '../enums/ticket-status';
import { CrearTicketRequestBody } from './ticket-api.model';

export type ActualizarTicketMemoriaPaso =
  | 'definicion'
  | 'asignacion'
  | 'diagnostico'
  | 'solucion'
  | 'validacion'
  | 'conocimiento';

export interface CrearTicketMemoria {
  codigoCaso: string;
  titulo: string;
  descripcion: string;
  origenTicket: 1 | 2;
  idUsuarioAsignado: number;
  esDesarrollo: boolean;
  idTipoCaso: number | null;
  idPrioridad: number | null;
  idImpacto: number | null;
  idEstadoHistoriaUsuario: number | null;
  historiaUsuario: string | null;
  idAmbienteReportado: number | null;
  comentarioInicial: string | null;
}

export interface CrearTicketFlowPayload {
  backendBody: CrearTicketRequestBody;
  memoria: CrearTicketMemoria;
}

export interface ActualizarTicketMemoria {
  titulo?: string | null;
  descripcion?: string | null;
  idEstadoHistoriaUsuario?: number | null;
  historiaUsuario?: string | null;
  esDesarrollo?: boolean | null;
  urlHu?: string | null;
  carpetaMedios?: string | null;
  estadoActual?: TicketStatus | null;
  idUsuarioAsignado?: number | null;

  sintomaConfirmado?: string | null;
  pasosReproduccion?: string | null;
  idAmbienteConfirmado?: number | null;
  idSeveridadDefecto?: number | null;
  idAplicativo?: string | null;
  causaRaiz?: string | null;

  solucionPropuesta?: string | null;
  solucionAplicada?: string | null;
  pullRequestUrl?: string | null;
  commitId?: string | null;
  idRepositorio?: string | null;
  idRama?: string | null;
  requiereDespliegue?: boolean | null;
  idRiesgoCambio?: number | null;
  observacionesTecnicas?: string | null;

  idResultadoValidacion?: number | null;
  idAmbienteValidado?: number | null;
  observacionesQa?: string | null;

  idCategoriaConocimiento?: number | null;
  idEstadoArticuloConocimiento?: number | null;
  resumenConocimiento?: string | null;
  recomendacionFutura?: string | null;
  idNivelReutilizacion?: number | null;
  tags?: string[] | null;
  casosRelacionados?: string[] | null;

  comentario?: string | null;
  fechaActualizacion: string;
  paso: ActualizarTicketMemoriaPaso;
}

export interface TicketWorkflowMemoryRecord {
  idTicket: string;
  codigoCaso: string;
  origen: 'backend' | 'memoria';
  creadoEn: string;
  actualizadoEn: string;
  creacion: CrearTicketMemoria;
  actualizaciones: ActualizarTicketMemoria[];
}
