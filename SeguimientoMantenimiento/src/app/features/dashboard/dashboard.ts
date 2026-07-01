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
import { DataTableComponent } from '../../shared/organisms/data-table/data-table';
import { Modal } from '../../shared/molecules/modal/modal';
import { AnalyticsChartsComponent } from '../../shared/molecules/analytics-charts/analytics-charts';
import { TicketMockService } from '../../core/services/ticket-mock';
import { UiGlobalService } from '../../core/services/ui-global';
import { FormularioTicketStepperComponent } from '../formulario-ticket-stepper/formulario-ticket-stepper';

import { StatusColors } from '../../models/constants/status-colors';

import { AuthMockService } from '../../core/services/auth-mock';
import { tieneFugaInformacion } from '../../models/utils/ticket.utils';

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
  private authService = inject(AuthMockService);

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  public usuarioRol = signal<'PMO_LT' | 'DEV' | 'QA'>('PMO_LT');
  public usuarioFirmaId = computed(() => this.authService.currentUser()?.idUsuario ?? 'DEV-Hamilton');

  constructor() {
    // Escuchar cambios de rol del auth service y mapearlo al rol del dashboard
    const roleMapping: Record<string, 'PMO_LT' | 'DEV' | 'QA'> = {
      'PRODUCT OWNER': 'PMO_LT',
      'LIDER TECNICO': 'PMO_LT',
      'DESARROLLADOR': 'DEV',
      'QA': 'QA'
    };

    // Actualizar signal basado en el rol actual
    const currentRole = this.authService.currentRole();
    this.usuarioRol.set(roleMapping[currentRole] || 'PMO_LT');
  }

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
    if (!estado) return 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide';
    return StatusColors[estado] || 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide';
  }

  public tieneFugaInformacion(ticket: Ticket | null): boolean {
    return tieneFugaInformacion(ticket);
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
