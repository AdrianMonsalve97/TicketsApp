import { Injectable, signal } from '@angular/core';
import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';
import {
  ActualizarTicketMemoria,
  CrearTicketFlowPayload,
  TicketWorkflowMemoryRecord,
} from '../../models/interfaces/ticket-workflow.model';

@Injectable({ providedIn: 'root' })
export class TicketWorkflowMemoryStoreService {
  private readonly storageKey = 'casetrack_ticket_workflow_memory';
  private readonly recordsSignal = signal<Record<string, TicketWorkflowMemoryRecord>>(this.loadRecords());

  public readonly records = this.recordsSignal.asReadonly();

  guardarCreacionBackend(idTicket: string, payload: CrearTicketFlowPayload): TicketWorkflowMemoryRecord {
    return this.guardarCreacion(idTicket, payload, 'backend');
  }

  crearTicketLocal(payload: CrearTicketFlowPayload): Ticket {
    const idTicket = `local-${crypto.randomUUID()}`;
    this.guardarCreacion(idTicket, payload, 'memoria');

    return {
      idTicket,
      codigoCaso: payload.memoria.codigoCaso,
      titulo: payload.memoria.titulo,
      descripcion: payload.memoria.descripcion,
      estadoActual: TicketStatus.EN_ANALISIS,
      idUsuarioAsignado: payload.memoria.idUsuarioAsignado,
      esDesarrollo: payload.memoria.esDesarrollo,
      nombreHu: payload.memoria.historiaUsuario ?? undefined,
      historiaUsuario: payload.memoria.historiaUsuario ?? undefined,
      fechaAsignacion: new Date(),
      fechaCreacion: new Date(),
      fechaUltimaActualizacion: new Date(),
      causaRaiz: undefined,
      solucionPropuesta: undefined,
      activo: true,
      fechaEliminacion: null,
      repositoriosAfectados: [],
      historial: [],
      desarrolladorAsignadoId: String(payload.memoria.idUsuarioAsignado),
    };
  }

  guardarActualizacion(ticket: Ticket, actualizacion: ActualizarTicketMemoria): void {
    this.recordsSignal.update((records) => {
      const idTicket = ticket.idTicket;
      const current = records[idTicket];
      const base = current ?? this.crearRegistroDesdeTicket(ticket);
      const nextRecords = {
        ...records,
        [idTicket]: {
          ...base,
          actualizadoEn: actualizacion.fechaActualizacion,
          actualizaciones: [...base.actualizaciones, actualizacion],
        },
      };

      this.persistRecords(nextRecords);
      return nextRecords;
    });
  }

  obtener(idTicket: string | null | undefined): TicketWorkflowMemoryRecord | null {
    if (!idTicket) return null;
    return this.recordsSignal()[idTicket] ?? null;
  }

  obtenerActualizacionConsolidada(idTicket: string | null | undefined): ActualizarTicketMemoria | null {
    const record = this.obtener(idTicket);
    if (!record || !record.actualizaciones.length) return null;
    return this.consolidarActualizaciones(record.actualizaciones);
  }

  aplicarMemoria(ticket: Ticket): Ticket {
    const latest = this.obtenerActualizacionConsolidada(ticket.idTicket);
    if (!latest) return ticket;

    return {
      ...ticket,
      titulo: latest.titulo ?? ticket.titulo,
      descripcion: latest.descripcion ?? ticket.descripcion,
      estadoActual: latest.estadoActual ?? ticket.estadoActual,
      idUsuarioAsignado: latest.idUsuarioAsignado ?? ticket.idUsuarioAsignado,
      fechaUltimaActualizacion: new Date(latest.fechaActualizacion),
      causaRaiz: latest.causaRaiz === null ? undefined : latest.causaRaiz ?? ticket.causaRaiz,
      solucionPropuesta: latest.solucionPropuesta === null ? undefined : latest.solucionPropuesta ?? ticket.solucionPropuesta,
      historiaUsuario: latest.historiaUsuario === null ? undefined : latest.historiaUsuario ?? ticket.historiaUsuario,
      esDesarrollo: latest.esDesarrollo ?? ticket.esDesarrollo,
      nombreHu: latest.historiaUsuario === null ? undefined : latest.historiaUsuario ?? ticket.nombreHu,
      urlHu: latest.urlHu === null ? undefined : latest.urlHu ?? ticket.urlHu,
      carpetaMedios: latest.carpetaMedios === null ? undefined : latest.carpetaMedios ?? ticket.carpetaMedios,
      desarrolladorAsignadoId: String(latest.idUsuarioAsignado ?? ticket.idUsuarioAsignado),
    };
  }

  obtenerTicketTemporal(idTicket: string | null | undefined): Ticket | null {
    const record = this.obtener(idTicket);
    if (!record) return null;

    const latest = record.actualizaciones.length ? this.consolidarActualizaciones(record.actualizaciones) : null;
    return {
      idTicket: record.idTicket,
      codigoCaso: record.creacion.codigoCaso,
      titulo: latest?.titulo ?? record.creacion.titulo,
      descripcion: latest?.descripcion ?? record.creacion.descripcion,
      estadoActual: latest?.estadoActual ?? TicketStatus.EN_ANALISIS,
      idUsuarioAsignado: latest?.idUsuarioAsignado ?? record.creacion.idUsuarioAsignado,
      fechaAsignacion: new Date(record.creadoEn),
      fechaCreacion: new Date(record.creadoEn),
      fechaUltimaActualizacion: new Date(record.actualizadoEn),
      causaRaiz: latest?.causaRaiz ?? undefined,
      solucionPropuesta: latest?.solucionPropuesta ?? undefined,
      historiaUsuario: latest?.historiaUsuario ?? record.creacion.historiaUsuario ?? undefined,
      esDesarrollo: latest?.esDesarrollo ?? record.creacion.esDesarrollo,
      nombreHu: latest?.historiaUsuario ?? record.creacion.historiaUsuario ?? undefined,
      urlHu: latest?.urlHu ?? undefined,
      carpetaMedios: latest?.carpetaMedios ?? undefined,
      activo: true,
      fechaEliminacion: null,
      repositoriosAfectados: [],
      historial: [],
      desarrolladorAsignadoId: String(latest?.idUsuarioAsignado ?? record.creacion.idUsuarioAsignado),
    };
  }

  limpiar(): void {
    this.recordsSignal.set({});
    this.removeStoredRecords();
  }

  private guardarCreacion(
    idTicket: string,
    payload: CrearTicketFlowPayload,
    origen: 'backend' | 'memoria',
  ): TicketWorkflowMemoryRecord {
    const now = new Date().toISOString();
    const record: TicketWorkflowMemoryRecord = {
      idTicket,
      codigoCaso: payload.memoria.codigoCaso,
      origen,
      creadoEn: now,
      actualizadoEn: now,
      creacion: payload.memoria,
      actualizaciones: [],
    };

    this.recordsSignal.update((records) => {
      const nextRecords = {
        ...records,
        [idTicket]: record,
      };
      this.persistRecords(nextRecords);
      return nextRecords;
    });

    return record;
  }

  private crearRegistroDesdeTicket(ticket: Ticket): TicketWorkflowMemoryRecord {
    const now = new Date().toISOString();
    return {
      idTicket: ticket.idTicket,
      codigoCaso: ticket.codigoCaso,
      origen: ticket.idTicket.startsWith('local-') ? 'memoria' : 'backend',
      creadoEn: now,
      actualizadoEn: now,
      creacion: {
        codigoCaso: ticket.codigoCaso,
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        origenTicket: 1,
        idUsuarioAsignado: ticket.idUsuarioAsignado,
        esDesarrollo: Boolean(ticket.esDesarrollo),
        idTipoCaso: null,
        idPrioridad: null,
        idImpacto: null,
        idEstadoHistoriaUsuario: null,
        historiaUsuario: ticket.historiaUsuario ?? null,
        idAmbienteReportado: null,
        comentarioInicial: null,
      },
      actualizaciones: [],
    };
  }

  private consolidarActualizaciones(actualizaciones: ActualizarTicketMemoria[]): ActualizarTicketMemoria {
    return actualizaciones.reduce<ActualizarTicketMemoria>(
      (acumulado, actualizacion) => ({
        ...acumulado,
        ...actualizacion,
        fechaActualizacion: actualizacion.fechaActualizacion,
        paso: actualizacion.paso,
      }),
      {
        fechaActualizacion: new Date().toISOString(),
        paso: 'definicion',
      },
    );
  }

  private loadRecords(): Record<string, TicketWorkflowMemoryRecord> {
    try {
      const rawRecords = sessionStorage.getItem(this.storageKey);
      return rawRecords ? (JSON.parse(rawRecords) as Record<string, TicketWorkflowMemoryRecord>) : {};
    } catch {
      return {};
    }
  }

  private persistRecords(records: Record<string, TicketWorkflowMemoryRecord>): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch {
      // La memoria de sesion es un respaldo; si falla, el signal sigue siendo la fuente activa.
    }
  }

  private removeStoredRecords(): void {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // No hay accion adicional: limpiar el signal ya evita usar datos anteriores.
    }
  }
}
