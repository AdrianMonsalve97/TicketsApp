import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  inject,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';
import { DataTableComponent } from '../../shared/organisms/data-table/data-table';
import { Modal } from '../../shared/molecules/modal/modal';
import { AnalyticsChartsComponent } from '../../shared/molecules/analytics-charts/analytics-charts';
import {
  ActualizarTicketRequestBody,
  CrearTicketRequestBody,
  TicketService,
  ticketStatusToBackend,
} from '../../core/services/ticket.service';
import { UiGlobalService } from '../../core/services/ui-global';
import { FormularioTicketStepperComponent } from '../formulario-ticket-stepper/formulario-ticket-stepper';

import { StatusColors } from '../../models/constants/status-colors';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { tieneFugaInformacion } from '../../models/utils/ticket.utils';
import { User } from '../../models/interfaces/user.model';

@Component({
  selector: 'app-dashboard',
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
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  public uiService = inject(UiGlobalService);
  private authService = inject(AuthService);

  tableContainer = viewChild<ElementRef>('tableContainer');

  public usuarioRol = signal<'PMO_LT' | 'DEV' | 'QA'>('PMO_LT');
  public usuarioFirmaId = computed(() => this.authService.currentUser()?.idUsuario ?? 'DEV-Hamilton');
  public usuarioFirmaIdNumero = computed(() => Number(this.authService.currentUser()?.idUsuario ?? 0));
  public usuarioNombre = computed(() => this.authService.currentUser()?.nombres || this.authService.currentUser()?.nombreUsuario || 'Usuario');

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
  public usuariosAsignables = signal<User[]>([]);
  public searchQuery = signal<string>('');
  public selectedStatus = signal<string>('');

  public isListVisible = false;
  public modalAbierto = false;
  public modalDetalleAbierto = false;
  public modalEditarAbierto = false;

  public ticketSeleccionado: Ticket | null = null;
  public estadosDisponibles = Object.values(TicketStatus);

  public tableColumns = [
    { key: 'codigoCaso', label: 'Caso ALM', type: 'code' as const },
    { key: 'titulo', label: 'Requerimiento' },
    { key: 'estadoActual', label: 'Estado', type: 'badge' as const },
    { key: 'desarrolladorAsignadoNombre', label: 'Asignado', type: 'avatar' as const },
  ];

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        const activos = users.filter((user) => user.activo);
        this.usuariosAsignables.set(activos);
        this.refrescarTickets();
      },
    });

    this.refrescarTickets();
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
    const tableContainer = this.tableContainer();
    if (tableContainer) observer.observe(tableContainer.nativeElement);
  }

  public obtenerColorEstado(estado: TicketStatus | string | undefined): string {
    if (!estado) return 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide';
    return StatusColors[estado] || 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide';
  }

  public tieneFugaInformacion(ticket: Ticket | null): boolean {
    return tieneFugaInformacion(ticket);
  }

  public puedeCambiarEstado(ticket: Ticket | null): boolean {
    if (!ticket) return false;
    if (this.usuarioRol() === 'PMO_LT') return true;
    return ticket.idUsuarioAsignado === this.usuarioFirmaIdNumero();
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
            t.idUsuarioAsignado === Number(miId) ||
            t.desarrolladorAsignadoId === miId ||
            (t.historial && t.historial.some((h) => String(h.idUsuarioAccion) === miId)),
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

  public procesarTicketCreado(nuevoTicket: CrearTicketRequestBody): void {
    if (this.usuarioRol() === 'DEV' && Number(nuevoTicket.idUsuarioAsignado) !== Number(this.usuarioFirmaId())) {
      nuevoTicket = {
        ...nuevoTicket,
        idUsuarioAsignado: Number(this.usuarioFirmaId()),
      };
    }

    if (nuevoTicket) {
      this.ticketService.createTicket(nuevoTicket).subscribe({
        next: (created) => {
          this.tickets.update((lista) => [created, ...lista]);
          this.modalAbierto = false;
        },
      });
    }
  }

  public guardarCambiosTicket(): void {
    if (this.ticketSeleccionado) {
      const idUsuarioAsignado =
        this.usuarioRol() === 'PMO_LT'
          ? Number(this.ticketSeleccionado.idUsuarioAsignado || 0)
          : Number(this.usuarioFirmaId());
      const nuevoEstado = this.puedeCambiarEstado(this.ticketSeleccionado)
        ? ticketStatusToBackend(this.ticketSeleccionado.estadoActual)
        : null;

      const body: ActualizarTicketRequestBody = {
        titulo: this.ticketSeleccionado.titulo,
        descripcion: this.ticketSeleccionado.descripcion,
        nuevoEstado,
        idUsuarioAsignado,
        causaRaiz: this.ticketSeleccionado.causaRaiz ?? null,
        solucionPropuesta: this.ticketSeleccionado.solucionPropuesta ?? null,
        comentario: 'Actualizado desde CaseTrack',
      };

      this.ticketService
        .updateTicket(this.ticketSeleccionado.idTicket, body, this.ticketSeleccionado)
        .subscribe({
        next: (updated) => {
          this.tickets.update((lista) =>
            lista.map((t) => (t.idTicket === updated.idTicket ? updated : t)),
          );
          this.modalEditarAbierto = false;
          this.ticketSeleccionado = null;
        },
      });
    }
  }

  private refrescarTickets(): void {
    const isAdmin = this.authService.currentRole() === 'PRODUCT OWNER';
    const request$ = isAdmin ? this.ticketService.getTickets() : this.ticketService.getMyTickets();

    request$.subscribe({
      next: (data: Ticket[]) => {
        this.tickets.set(this.enriquecerTicketsConUsuarios(data));
      },
    });
  }

  private enriquecerTicketsConUsuarios(tickets: Ticket[]): Ticket[] {
    const usuariosPorId = new Map(
      this.usuariosAsignables().map((usuario) => [Number(usuario.idUsuario), usuario]),
    );

    return tickets.map((ticket) => {
      const usuario = usuariosPorId.get(ticket.idUsuarioAsignado);
      return {
        ...ticket,
        desarrolladorAsignadoNombre:
          usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : ticket.desarrolladorAsignadoNombre ?? 'Sin asignar',
      };
    });
  }
}
