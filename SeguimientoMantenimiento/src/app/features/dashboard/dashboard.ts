import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';
import { DataTableComponent } from '../../shared/organism/data-table/data-table';
import { Modal } from '../../shared/molecules/modal/modal';
import { AnalyticsChartsComponent } from '../../shared/molecules/analytics-charts/analytics-charts';
import { TicketMockService } from '../../core/services/ticket-mock';
import { UiGlobalService } from '../../core/services/ui-global';
import { FormularioTicketStepperComponent } from '../formulario-ticket-stepper/formulario-ticket-stepper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    Modal,
    FormularioTicketStepperComponent,
    AnalyticsChartsComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  private ticketService = inject(TicketMockService);
  public uiService = inject(UiGlobalService);

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  public usuarioRol = signal<'PMO_LT' | 'DEV' | 'QA'>('PMO_LT');
  public usuarioFirmaId = signal<string>('DEV-Hamilton');

  public tickets = signal<Ticket[]>([]);
  public searchQuery = signal<string>('');
  public selectedStatus = signal<string>('');

  public isListVisible = false;
  public modalAbierto = false;
  public modalDetalleAbierto = false;
  public modalEditarAbierto = false;

  public ticketSeleccionado: Ticket | null = null;
  public estadosDisponibles = Object.values(TicketStatus);

  public tableColumns = [
    { key: 'idTicket', label: 'ID', type: 'code' as const },
    { key: 'codigoCaso', label: 'Caso ALM', type: 'code' as const },
    { key: 'titulo', label: 'Requerimiento' },
    { key: 'estadoActual', label: 'Estado', type: 'badge' as const },
    { key: 'desarrolladorAsignadoId', label: 'Desarrollador', type: 'avatar' as const },
  ];

  ngOnInit(): void {
    this.ticketService.getTickets().subscribe({
      next: (data: Ticket[]) => this.tickets.set(data),
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isListVisible = true;
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 },
    );
    if (this.tableContainer) observer.observe(this.tableContainer.nativeElement);
  }

  public obtenerColorEstado(estado: TicketStatus | string | undefined): string {
    const fallbackClasses =
      'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide';
    if (!estado) return fallbackClasses;

    switch (estado) {
      case TicketStatus.EN_PROCESO:
      case TicketStatus.EN_ANALISIS:
        return 'bg-[#080d1a] text-[#a9c7ff] border border-[#3b82f6]/40 font-mono tracking-wide';
        case TicketStatus.BLOQUEO:
      case TicketStatus.ROLLBACK:
        return 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide';

      case TicketStatus.CERTIFICADO:
      case TicketStatus.DESPLIEGUE_A_PRODUCCION:
      case TicketStatus.FINALIZADO:
        return 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide';

      case TicketStatus.DESPLIEGUE_A_DESARROLLO:
        return 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide';

      case TicketStatus.EN_REVISION_DESARROLLO:
      case TicketStatus.EN_REVISION_QA:
        return 'bg-[#1a1908] text-[#fef08a] border border-[#eab308]/40 font-mono tracking-wide';

      case TicketStatus.APROBADO_PARA_QA:
      case TicketStatus.DESPLIEGUE_A_QA:
        return 'bg-[#081a18] text-[#99f6e4] border border-[#14b8a6]/40 font-mono tracking-wide';

      case TicketStatus.PENDIENTE_CERTIFICACION:
        return 'bg-[#1a1108] text-[#fed7aa] border border-[#f97316]/40 font-mono tracking-wide';

      case TicketStatus.DEVUELTO:
        return 'bg-[#1a0814] text-[#fbcfe8] border border-[#ec4899]/40 font-mono tracking-wide';

      default:
        return fallbackClasses;
    }
  }

  public tieneFugaInformacion(ticket: Ticket | null): boolean {
    if (!ticket) return false;
    return !ticket.historiaUsuario || ticket.historiaUsuario.trim() === '';
  }

  public ticketsFiltradosPorRol = computed(() => {
    const listaOriginal = this.tickets();
    const rol = this.usuarioRol();
    const miId = this.usuarioFirmaId();
    const busqueda = this.searchQuery().toLowerCase();
    const filtroEstado = this.selectedStatus();

    let dataSegura: Ticket[] = [];
    switch (rol) {
      case 'PMO_LT':
        dataSegura = listaOriginal;
        break;
      case 'DEV':
        dataSegura = listaOriginal.filter(
          (t) =>
            t.desarrolladorAsignadoId === miId ||
            (t.historial && t.historial.some((h) => h.idUsuarioAccion === miId)),
        );
        break;
      case 'QA':
        dataSegura = listaOriginal.filter(
          (t) =>
            t.qaAsignadoId === miId ||
            t.estadoActual.includes('QA') ||
            t.estadoActual === TicketStatus.PENDIENTE_CERTIFICACION,
        );
        break;
    }

    if (busqueda) {
      dataSegura = dataSegura.filter(
        (t) =>
          t.titulo.toLowerCase().includes(busqueda) ||
          t.idTicket.toLowerCase().includes(busqueda) ||
          t.codigoCaso.toLowerCase().includes(busqueda),
      );
    }
    if (filtroEstado) dataSegura = dataSegura.filter((t) => t.estadoActual === filtroEstado);

    return dataSegura;
  });

  public abrirDetalleTicket(ticket: Ticket): void {
    this.ticketSeleccionado = ticket;
    this.modalDetalleAbierto = true;
  }

  public abrirEdicionTicket(ticket: Ticket): void {
    this.ticketSeleccionado = JSON.parse(JSON.stringify(ticket));
    this.modalEditarAbierto = true;
  }

  public procesarTicketCreado(nuevoTicket: any): void {
    if (nuevoTicket) {
      const ticketEstructurado: Ticket = {
        ...nuevoTicket,
        fechaAsignacion: nuevoTicket.fechaAsignacion
          ? new Date(nuevoTicket.fechaAsignacion)
          : new Date(),
        fechaUltimaActualizacion: new Date(),
        repositoriosAfectados: nuevoTicket.repositoriosAfectados || [],
        historial: nuevoTicket.historial || [],
      };
      this.tickets.update((lista) => [ticketEstructurado, ...lista]);
      this.modalAbierto = false;
    }
  }

  public guardarCambiosTicket(): void {
    if (this.ticketSeleccionado) {
      const actualizado = { ...this.ticketSeleccionado, fechaUltimaActualizacion: new Date() };
      this.tickets.update((lista) =>
        lista.map((t) => (t.idTicket === actualizado.idTicket ? actualizado : t)),
      );
      this.modalEditarAbierto = false;
      this.ticketSeleccionado = null;
    }
  }
}
