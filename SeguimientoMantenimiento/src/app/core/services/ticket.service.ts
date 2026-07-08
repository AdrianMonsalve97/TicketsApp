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
  CrearTicketRequestBody,
  TicketDto,
  ticketStatusFromBackend,
  ticketStatusToBackend,
} from '../../models/interfaces/ticket-api.model';

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
          activo: true,
          fechaEliminacion: null,
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
        estadoActual: body.nuevoEstado
          ? ticketStatusFromBackend(body.nuevoEstado)
          : fallback?.estadoActual ?? TicketStatus.EN_ANALISIS,
        idUsuarioAsignado: body.idUsuarioAsignado ?? fallback?.idUsuarioAsignado ?? 0,
        codigoCaso: fallback?.codigoCaso ?? '',
        fechaAsignacion: fallback?.fechaAsignacion ?? new Date(),
        activo: fallback?.activo ?? true,
        fechaEliminacion: fallback?.fechaEliminacion ?? null,
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
      estadoActual: ticketStatusFromBackend(ticket.ticketEstado),
      idUsuarioAsignado: assignedUser,
      fechaAsignacion: new Date(ticket.fechaCreacion),
      fechaCreacion: new Date(ticket.fechaCreacion),
      fechaUltimaActualizacion: ticket.fechaUltimaActualizacion
        ? new Date(ticket.fechaUltimaActualizacion)
        : new Date(ticket.fechaCreacion),
      causaRaiz: ticket.causaRaiz ?? undefined,
      solucionPropuesta: ticket.solucionPropuesta ?? undefined,
      activo: ticket.activo,
      fechaEliminacion: ticket.fechaEliminacion ? new Date(ticket.fechaEliminacion) : null,
      repositoriosAfectados: [],
      historial: (ticket.comentarios ?? []).map((comentario) => ({
        idHistorico: crypto.randomUUID(),
        idTicket: ticket.idTicket,
        idEstadoOrigen: ticketStatusFromBackend(comentario.estadoOrigen),
        idEstadoDestino: ticketStatusFromBackend(comentario.estadoDestino),
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

}
