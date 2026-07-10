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
import { Router } from '@angular/router';
import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';
import { DataTableComponent } from '../../shared/organisms/data-table/data-table';
import { Modal } from '../../shared/molecules/modal/modal';
import { AnalyticsChartsComponent } from '../../shared/molecules/analytics-charts/analytics-charts';
import { TicketService } from '../../core/services/ticket.service';
import { RepositorioRamaService } from '../../core/services/repositorio-rama';
import { AplicativoService } from '../../core/services/aplicativo.service';
import { ActualizarTicketRequestBody } from '../../models/interfaces/ticket-api.model';
import { ticketStatusToBackend } from '../../models/interfaces/ticket-api.model';
import { UiGlobalService } from '../../core/services/ui-global';
import { FormularioTicketStepperComponent } from '../formulario-ticket-stepper/formulario-ticket-stepper';
import {
  ActualizarTicketStepSave,
  ActualizarTicketStepperComponent,
} from '../actualizar-ticket-stepper/actualizar-ticket-stepper';
import { TicketKnowledgeMapComponent } from '../../shared/molecules/ticket-knowledge-map/ticket-knowledge-map';

import { StatusColors } from '../../models/constants/status-colors';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { tieneFugaInformacion } from '../../models/utils/ticket.utils';
import { User } from '../../models/interfaces/user.model';
import {
  canAssignUsersOnCreate,
  canEditTicketDefinition,
  canReassignTickets,
  canViewAllTickets,
  roleToDashboardRole,
} from '../../models/utils/role.utils';
import { Roles } from '../../models/enums/roles';
import {
  ActualizarTicketMemoria,
  CrearTicketFlowPayload,
  TicketWorkflowMemoryRecord,
} from '../../models/interfaces/ticket-workflow.model';
import { TicketWorkflowMemoryStoreService } from '../../core/state/ticket-workflow-memory-store.service';
import { ToastService } from '../../core/services/toast.service';
import { CatalogoStoreService } from '../../core/state/catalogo-store.service';
import { TicketCatalogoKey } from '../../models/interfaces/catalogo.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    Modal,
    FormularioTicketStepperComponent,
    ActualizarTicketStepperComponent,
    TicketKnowledgeMapComponent,
    AnalyticsChartsComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  private ticketService = inject(TicketService);
  private repositorioRamaService = inject(RepositorioRamaService);
  private aplicativoService = inject(AplicativoService);
  private userService = inject(UserService);
  public uiService = inject(UiGlobalService);
  private authService = inject(AuthService);
  private ticketWorkflowMemoryStore = inject(TicketWorkflowMemoryStoreService);
  private toastService = inject(ToastService);
  private catalogoStore = inject(CatalogoStoreService);
  private router = inject(Router);

  tableContainer = viewChild<ElementRef>('tableContainer');

  public usuarioRol = signal<'PMO_LT' | 'DEV' | 'QA'>('PMO_LT');
  public usuarioFirmaId = computed(() => this.authService.currentUser()?.idUsuario ?? 'DEV-Hamilton');
  public usuarioFirmaIdNumero = computed(() => Number(this.authService.currentUser()?.idUsuario ?? 0));
  public usuarioNombre = computed(() => this.authService.currentUser()?.nombres || this.authService.currentUser()?.nombreUsuario || 'Usuario');

  constructor() {
    this.usuarioRol.set(roleToDashboardRole(this.authService.currentRole()));
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
  private ticketOriginalEdicion: Ticket | null = null;
  public estadosDisponibles = Object.values(TicketStatus).filter(
    (estado) => estado !== TicketStatus.FINALIZADO,
  );
  public puedeAsignarUsuarios = computed(() => canAssignUsersOnCreate(this.authService.currentRole()));
  public puedeReasignarTickets = computed(() => canReassignTickets(this.authService.currentRole()));
  public puedeEditarDefinicionTicket = computed(() =>
    canEditTicketDefinition(this.authService.currentRole()),
  );

  public tableColumns = [
    { key: 'codigoCaso', label: 'Caso ALM', type: 'code' as const },
    { key: 'titulo', label: 'Requerimiento' },
    { key: 'estadoActual', label: 'Estado', type: 'badge' as const },
    { key: 'desarrolladorAsignadoNombre', label: 'Asignado', type: 'avatar' as const },
  ];

  ngOnInit(): void {
    if (canViewAllTickets(this.authService.currentRole())) {
      this.userService.getUsers().subscribe({
        next: (users) => {
          const activos = users.filter((user) => user.activo && !user.bloqueado);
          this.usuariosAsignables.set(activos);
          this.refrescarTickets();
        },
        error: () => this.refrescarTickets(),
      });
      return;
    }

    const currentUser = this.authService.currentUser();
    this.usuariosAsignables.set(currentUser ? [currentUser] : []);
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
    const role = this.authService.currentRole();
    if (role === Roles.Product_Owner || role === Roles.Lider_Tecnico) return true;
    return ticket.idUsuarioAsignado === this.usuarioFirmaIdNumero();
  }

  public puedeEditarDiagnosticoTicket(ticket: Ticket | null): boolean {
    if (!ticket) return false;
    const role = this.authService.currentRole();
    const esAsignado = Number(ticket.idUsuarioAsignado) === this.usuarioFirmaIdNumero();
    return role === Roles.Desarrollador && esAsignado;
  }

  public obtenerNombreUsuarioAsignado(ticket: Ticket | null): string {
    if (!ticket || !ticket.idUsuarioAsignado) return 'Sin asignar';
    return ticket.desarrolladorAsignadoNombre || this.obtenerNombreUsuarioPorId(ticket.idUsuarioAsignado);
  }

  public obtenerRolUsuarioAsignado(ticket: Ticket | null): string {
    const usuario = this.buscarUsuarioPorId(ticket?.idUsuarioAsignado);
    return usuario?.rol ?? 'No disponible';
  }

  public obtenerUltimoUsuarioAccion(ticket: Ticket | null): string {
    const ultimoMovimiento = [...(ticket?.historial ?? [])].sort(
      (a, b) => b.fechaCambio.getTime() - a.fechaCambio.getTime(),
    )[0];

    if (!ultimoMovimiento?.idUsuarioAccion) return 'Sin registro';
    return this.obtenerNombreUsuarioPorId(ultimoMovimiento.idUsuarioAccion);
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
    this.router.navigate(['/tickets', ticket.idTicket]);
  }

  public abrirEdicionTicket(ticket: Ticket): void {
    this.router.navigate(['/tickets', ticket.idTicket], { queryParams: { editar: '1' } });
  }

  public procesarTicketCreado(payload: CrearTicketFlowPayload): void {
    if (!this.puedeAsignarUsuarios() && Number(payload.backendBody.idUsuarioAsignado) !== Number(this.usuarioFirmaId())) {
      payload = {
        backendBody: {
          ...payload.backendBody,
          idUsuarioAsignado: Number(this.usuarioFirmaId()),
        },
        memoria: {
          ...payload.memoria,
          idUsuarioAsignado: Number(this.usuarioFirmaId()),
        },
      };
    }

    if (payload.backendBody) {
      this.ticketService.createTicket(payload.backendBody).subscribe({
        next: (created) => {
          this.ticketWorkflowMemoryStore.guardarCreacionBackend(created.idTicket, payload);
          this.tickets.update((lista) => [this.enriquecerTicketsConUsuarios([created])[0], ...lista]);
          this.modalAbierto = false;
        },
        error: () => {
          const localTicket = this.ticketWorkflowMemoryStore.crearTicketLocal(payload);
          this.tickets.update((lista) => [this.enriquecerTicketsConUsuarios([localTicket])[0], ...lista]);
          this.modalAbierto = false;
          this.toastService.warning(
            `ticket-local-${localTicket.idTicket}`,
            'Ticket guardado en memoria',
            'El backend no recibio este nuevo flujo. Se conservara solo durante la sesion actual.',
          );
        },
      });
    }
  }

  public guardarCambiosTicket(): void {
    if (this.ticketSeleccionado && this.ticketOriginalEdicion) {
      const body = this.construirBodyActualizacion(this.ticketSeleccionado, this.ticketOriginalEdicion);
      if (!Object.keys(body).length) {
        this.guardarActualizacionEnMemoria(this.ticketSeleccionado);
        this.modalEditarAbierto = false;
        this.ticketSeleccionado = null;
        this.ticketOriginalEdicion = null;
        return;
      }

      this.guardarActualizacionEnMemoria(this.ticketSeleccionado);
      this.ticketService
        .updateTicket(this.ticketSeleccionado.idTicket, body, this.ticketSeleccionado)
        .subscribe({
        next: (updated) => {
          this.tickets.update((lista) =>
            lista.map((t) => (t.idTicket === updated.idTicket ? updated : t)),
          );
          this.modalEditarAbierto = false;
          this.ticketSeleccionado = null;
          this.ticketOriginalEdicion = null;
          this.refrescarTickets();
        },
        error: () => {
          const ticketActualizado = {
            ...this.ticketSeleccionado!,
            fechaUltimaActualizacion: new Date(),
          };
          this.tickets.update((lista) =>
            lista.map((t) => (t.idTicket === ticketActualizado.idTicket ? ticketActualizado : t)),
          );
          this.modalEditarAbierto = false;
          this.ticketSeleccionado = null;
          this.ticketOriginalEdicion = null;
          this.toastService.warning(
            `ticket-update-local-${ticketActualizado.idTicket}`,
            'Actualizacion guardada en memoria',
            'El backend no recibio este nuevo flujo. El cambio vive solo en esta sesion.',
          );
        },
      });
    }
  }

  public procesarActualizacionTicket(payload: ActualizarTicketStepSave): void {
    this.ticketWorkflowMemoryStore.guardarActualizacion(payload.updatedTicket, payload.memoria);

    const debeEnviarBackend =
      (
        Object.keys(payload.backendBody).length > 0 ||
        (this.puedeReasignarTickets() && Boolean(payload.aplicativoAsignado || payload.ramaAsignada))
      ) &&
      !payload.updatedTicket.idTicket.startsWith('local-');

    if (!debeEnviarBackend) {
      this.aplicarTicketActualizado(payload.updatedTicket);
      this.toastService.success(
        `ticket-memory-step-${payload.updatedTicket.idTicket}-${payload.paso}`,
        'Seccion guardada en memoria',
        'Los datos se conservaran durante esta sesion.',
      );
      return;
    }

    if (!Object.keys(payload.backendBody).length) {
      this.aplicarTicketActualizado(payload.updatedTicket);
      this.asignarDependenciasTicket(payload);
      return;
    }

    this.ticketService
      .updateTicket(payload.updatedTicket.idTicket, payload.backendBody, payload.updatedTicket)
      .subscribe({
        next: (updated) => {
          this.aplicarTicketActualizado(updated);
          this.asignarDependenciasTicket(payload);
          this.toastService.success(
            `ticket-backend-step-${updated.idTicket}-${payload.paso}`,
            'Seccion actualizada',
            'El backend recibio los campos compatibles y la memoria guardo el resto.',
          );
        },
        error: () => {
          this.aplicarTicketActualizado(payload.updatedTicket);
          this.toastService.warning(
            `ticket-update-local-${payload.updatedTicket.idTicket}-${payload.paso}`,
            'Seccion guardada en memoria',
            'El backend no recibio esta actualizacion. El cambio vive solo en esta sesion.',
          );
        },
      });
  }

  public obtenerMemoriaTicket(ticket: Ticket | null): TicketWorkflowMemoryRecord | null {
    return this.ticketWorkflowMemoryStore.obtener(ticket?.idTicket);
  }

  public nombreParametro(key: TicketCatalogoKey, idParametro: number | null | undefined): string {
    if (!idParametro) return 'Sin definir';
    return this.catalogoStore.findById(key, idParametro)?.nombre ?? 'Sin definir';
  }

  private refrescarTickets(): void {
    const request$ = canViewAllTickets(this.authService.currentRole())
      ? this.ticketService.getTickets()
      : this.ticketService.getMyTickets();

    request$.subscribe({
      next: (data: Ticket[]) => {
        this.tickets.set(this.enriquecerTicketsConUsuarios(data));
      },
    });
  }

  private aplicarTicketActualizado(ticket: Ticket): void {
    const enriquecido = this.enriquecerTicketsConUsuarios([ticket])[0];
    this.tickets.update((lista) =>
      lista.map((item) => (item.idTicket === enriquecido.idTicket ? enriquecido : item)),
    );
    this.ticketSeleccionado = { ...enriquecido };
  }

  private asignarDependenciasTicket(payload: ActualizarTicketStepSave): void {
    if (!this.puedeReasignarTickets() || payload.updatedTicket.idTicket.startsWith('local-')) return;

    if (payload.aplicativoAsignado) {
      this.aplicativoService
        .asignarAplicativoTicket(payload.updatedTicket.idTicket, payload.aplicativoAsignado.idAplicativo)
        .subscribe({
          next: () => {
            this.toastService.success(
              `dashboard-app-${payload.updatedTicket.idTicket}-${payload.aplicativoAsignado?.idAplicativo}`,
              'Aplicacion asociada',
              'La aplicacion quedo vinculada al ticket.',
            );
          },
          error: () => {
            this.toastService.warning(
              `dashboard-app-error-${payload.updatedTicket.idTicket}-${payload.aplicativoAsignado?.idAplicativo}`,
              'No se asocio la aplicacion',
              'Puede que ya este vinculada al ticket.',
            );
          },
        });
    }

    if (!payload.ramaAsignada) return;

    this.repositorioRamaService
      .asignarRamaTicket(
        payload.updatedTicket.idTicket,
        payload.ramaAsignada.idRepositorio,
        payload.ramaAsignada.idRama,
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `dashboard-rama-${payload.updatedTicket.idTicket}-${payload.ramaAsignada?.idRama}`,
            'Rama asociada',
            'El repositorio quedo vinculado al ticket.',
          );
        },
        error: () => {
          this.toastService.warning(
            `dashboard-rama-error-${payload.updatedTicket.idTicket}-${payload.ramaAsignada?.idRama}`,
            'No se asocio la rama',
            'Revisa que el ticket sea de desarrollo y que la rama no este duplicada.',
          );
        },
      });
  }

  private enriquecerTicketsConUsuarios(tickets: Ticket[]): Ticket[] {
    const usuariosPorId = new Map(
      this.usuariosAsignables().map((usuario) => [Number(usuario.idUsuario), usuario]),
    );

    return tickets.map((ticketOriginal) => {
      const ticket = this.ticketWorkflowMemoryStore.aplicarMemoria(ticketOriginal);
      const usuario = usuariosPorId.get(ticket.idUsuarioAsignado);
      return {
        ...ticket,
        desarrolladorAsignadoNombre:
          usuario ? this.formatearNombreUsuario(usuario) : ticket.desarrolladorAsignadoNombre ?? 'Sin asignar',
      };
    });
  }

  private obtenerNombreUsuarioPorId(idUsuario: number | string | null | undefined): string {
    const usuario = this.buscarUsuarioPorId(idUsuario);
    if (usuario) return this.formatearNombreUsuario(usuario);

    const currentUser = this.authService.currentUser();
    if (currentUser && Number(currentUser.idUsuario) === Number(idUsuario)) {
      return this.formatearNombreUsuario(currentUser);
    }

    return 'Usuario no disponible';
  }

  private buscarUsuarioPorId(idUsuario: number | string | null | undefined): User | undefined {
    if (!idUsuario) return undefined;
    return this.usuariosAsignables().find(
      (usuario) => Number(usuario.idUsuario) === Number(idUsuario),
    );
  }

  private formatearNombreUsuario(usuario: User): string {
    return `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.nombreUsuario;
  }

  private construirBodyActualizacion(ticket: Ticket, original: Ticket): ActualizarTicketRequestBody {
    const body: ActualizarTicketRequestBody = {};
    const comentario = ticket.carpetaMedios?.trim();

    if (this.puedeEditarDefinicionTicket() && ticket.titulo !== original.titulo) {
      body.titulo = ticket.titulo;
    }

    if (this.puedeEditarDefinicionTicket() && ticket.descripcion !== original.descripcion) {
      body.descripcion = ticket.descripcion;
    }

    if (this.puedeCambiarEstado(original) && ticket.estadoActual !== original.estadoActual) {
      body.nuevoEstado = ticketStatusToBackend(ticket.estadoActual);
    }

    if (
      this.puedeReasignarTickets() &&
      Number(ticket.idUsuarioAsignado) !== Number(original.idUsuarioAsignado)
    ) {
      body.idUsuarioAsignado = Number(ticket.idUsuarioAsignado);
    }

    const role = this.authService.currentRole();
    const puedeEditarDiagnostico =
      role === Roles.Desarrollador &&
      Number(original.idUsuarioAsignado) === this.usuarioFirmaIdNumero();

    if (puedeEditarDiagnostico && ticket.causaRaiz !== original.causaRaiz) {
      body.causaRaiz = ticket.causaRaiz ?? null;
    }

    if (puedeEditarDiagnostico && ticket.solucionPropuesta !== original.solucionPropuesta) {
      body.solucionPropuesta = ticket.solucionPropuesta ?? null;
    }

    if (comentario) {
      body.comentario = comentario;
    }

    return body;
  }

  private guardarActualizacionEnMemoria(ticket: Ticket): void {
    const actualizacion: ActualizarTicketMemoria = {
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      estadoActual: ticket.estadoActual,
      idUsuarioAsignado: Number(ticket.idUsuarioAsignado),
      causaRaiz: ticket.causaRaiz ?? null,
      solucionPropuesta: ticket.solucionPropuesta ?? null,
      comentario: ticket.carpetaMedios?.trim() || null,
      fechaActualizacion: new Date().toISOString(),
      paso: 'diagnostico',
    };

    this.ticketWorkflowMemoryStore.guardarActualizacion(ticket, actualizacion);
  }
}
