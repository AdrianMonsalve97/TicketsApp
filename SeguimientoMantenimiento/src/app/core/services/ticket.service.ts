import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Ticket } from '../../models/interfaces/ticket.model';
import { TicketStatus } from '../../models/enums/ticket-status';
import { API_BASE_URL } from './api.config';
import { TicketFilter } from '../../models/interfaces/ticket-filter.model';
import { ApiResponse, PageResult } from '../../models/interfaces/api-response.model';
import {
  ActualizarTicketRequestBody,
  BackendTicketEstado,
  CrearTicketRequestBody,
  TicketDto,
  TicketHistoryDto,
} from '../../models/interfaces/ticket-api.model';

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

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  getTickets(filter: TicketFilter = { pagina: 1, tamanoPagina: 100 }): Observable<Ticket[]> {
    return this.getTicketsPage(filter).pipe(map((page) => page.elementos));
  }

  getTicketsPage(filter: TicketFilter = {}): Observable<PageResult<Ticket>> {
    return this.http
      .get<ApiResponse<PageResult<TicketDto>>>(`${API_BASE_URL}/tickets`, {
        params: this.buildTicketParams({ pagina: 1, tamanoPagina: 100, ...filter }),
      })
      .pipe(map((response) => this.mapTicketPage(response.data)));
  }

  getMyTickets(filter: TicketFilter = { pagina: 1, tamanoPagina: 100 }): Observable<Ticket[]> {
    return this.getMyTicketsPage(filter).pipe(map((page) => page.elementos));
  }

  getMyTicketsPage(filter: TicketFilter = {}): Observable<PageResult<Ticket>> {
    return this.http
      .get<ApiResponse<PageResult<TicketDto>>>(`${API_BASE_URL}/tickets/mis-tickets`, {
        params: this.buildTicketParams({ pagina: 1, tamanoPagina: 100, ...filter }),
      })
      .pipe(map((response) => this.mapTicketPage(response.data)));
  }

  getTicketById(idTicket: string): Observable<Ticket> {
    return this.http
      .get<ApiResponse<TicketDto>>(`${API_BASE_URL}/tickets/${idTicket}`)
      .pipe(map((response) => this.mapTicket(response.data)));
  }

  createTicket(ticket: CrearTicketRequestBody): Observable<Ticket> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/tickets`, ticket)
      .pipe(
        map((response) => ({
          idTicket: response.data,
          codigoCaso: ticket.codigoCaso,
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          estadoActual: TicketStatus.EN_ANALISIS,
          idUsuarioAsignado: Number(ticket.idUsuarioAsignado || 0),
          fechaAsignacion: new Date(),
          fechaUltimaActualizacion: new Date(),
          repositoriosAfectados: [],
          historial: [],
        })),
      );
  }

  updateTicket(ticketId: string, body: ActualizarTicketRequestBody, fallback?: Ticket): Observable<Ticket> {
    return this.http.patch<ApiResponse<boolean>>(`${API_BASE_URL}/tickets/${ticketId}`, body).pipe(
      map(() => ({
        ...(fallback ?? ({} as Ticket)),
        idTicket: ticketId,
        fechaUltimaActualizacion: new Date(),
        titulo: body.titulo ?? fallback?.titulo ?? '',
        descripcion: body.descripcion ?? fallback?.descripcion ?? '',
        estadoActual: this.mapStatusFromBackend(body.nuevoEstado ?? 'EnAnalisis'),
        idUsuarioAsignado: body.idUsuarioAsignado ?? fallback?.idUsuarioAsignado ?? 0,
        codigoCaso: fallback?.codigoCaso ?? '',
        fechaAsignacion: fallback?.fechaAsignacion ?? new Date(),
        repositoriosAfectados: fallback?.repositoriosAfectados ?? [],
        historial: fallback?.historial ?? [],
      })),
    );
  }

  deleteTicket(idTicket: string, comentario = 'Eliminado desde CaseTrack'): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${API_BASE_URL}/tickets/${idTicket}`, {
        params: { comentario },
      })
      .pipe(map((response) => response.data));
  }

  private mapTicket(ticket: TicketDto): Ticket {
    const assignedUser = ticket.idUsuarioAsignado ?? 0;
    return {
      idTicket: ticket.idTicket,
      codigoCaso: ticket.idCaso,
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      estadoActual: this.mapStatusFromBackend(ticket.ticketEstado),
      idUsuarioAsignado: assignedUser,
      fechaAsignacion: new Date(ticket.fechaCreacion),
      fechaCreacion: new Date(ticket.fechaCreacion),
      fechaUltimaActualizacion: ticket.fechaUltimaActualizacion
        ? new Date(ticket.fechaUltimaActualizacion)
        : new Date(ticket.fechaCreacion),
      causaRaiz: ticket.causaRaiz ?? undefined,
      solucionPropuesta: ticket.solucionPropuesta ?? undefined,
      repositoriosAfectados: [],
      historial: (ticket.comentarios ?? []).map((comentario) => ({
        idHistorico: crypto.randomUUID(),
        idTicket: ticket.idTicket,
        idEstadoOrigen: this.mapStatusFromBackend(comentario.estadoOrigen),
        idEstadoDestino: this.mapStatusFromBackend(comentario.estadoDestino),
        idUsuarioAccion: comentario.idUsuarioAccion ? String(comentario.idUsuarioAccion) : '',
        fechaCambio: new Date(comentario.fechaAccion),
        comentario: comentario.comentario ?? '',
      })),
      desarrolladorAsignadoId: assignedUser ? String(assignedUser) : undefined,
    };
  }

  private mapTicketPage(page: PageResult<TicketDto>): PageResult<Ticket> {
    return { ...page, elementos: page.elementos.map((ticket) => this.mapTicket(ticket)) };
  }

  private buildTicketParams(filter: TicketFilter): HttpParams {
    let params = new HttpParams();
    const paramsMap: Array<[string, string | number | boolean | undefined]> = [
      ['pagina', filter.pagina],
      ['tamanoPagina', filter.tamanoPagina],
      ['estado', filter.estado ? ticketStatusToBackend(filter.estado) : undefined],
      ['origen', filter.origen],
      ['idUsuarioAsignado', filter.idUsuarioAsignado],
      ['codigoCaso', filter.codigoCaso],
      ['desde', filter.desde ? this.toIsoString(filter.desde) : undefined],
      ['hasta', filter.hasta ? this.toIsoString(filter.hasta) : undefined],
      ['incluirEliminados', filter.incluirEliminados],
    ];

    for (const [key, value] of paramsMap) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }
    return params;
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : value;
  }

  private mapStatusFromBackend(status: BackendTicketEstado): TicketStatus {
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
      AprobadoQA: TicketStatus.PENDIENTE_CERTIFICACION,
      PendienteCertificacion: TicketStatus.PENDIENTE_CERTIFICACION,
      Certificado: TicketStatus.CERTIFICADO,
      DespliegueProduccion: TicketStatus.DESPLIEGUE_A_PRODUCCION,
      BUG: TicketStatus.DEVUELTO,
      Rollback: TicketStatus.ROLLBACK,
    };
    return statuses[status] ?? TicketStatus.EN_ANALISIS;
  }
}
