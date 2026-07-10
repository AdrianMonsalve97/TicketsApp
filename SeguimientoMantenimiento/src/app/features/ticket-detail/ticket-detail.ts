import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Modal } from '../../shared/molecules/modal/modal';
import { TicketKnowledgeMapComponent } from '../../shared/molecules/ticket-knowledge-map/ticket-knowledge-map';
import {
  ActualizarTicketStepSave,
  ActualizarTicketStepperComponent,
} from '../actualizar-ticket-stepper/actualizar-ticket-stepper';
import { Ticket } from '../../models/interfaces/ticket.model';
import { TicketStatus } from '../../models/enums/ticket-status';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';
import { TicketService } from '../../core/services/ticket.service';
import { RepositorioRamaService, RamaTicketDetalle } from '../../core/services/repositorio-rama';
import { AplicativoService } from '../../core/services/aplicativo.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CatalogoStoreService } from '../../core/state/catalogo-store.service';
import { TicketWorkflowMemoryStoreService } from '../../core/state/ticket-workflow-memory-store.service';
import { StatusColors } from '../../models/constants/status-colors';
import { TicketCatalogoKey } from '../../models/interfaces/catalogo.model';
import { AplicativoTicket } from '../../models/interfaces/aplicativo.model';
import {
  canEditTicketDefinition,
  canReassignTickets,
  canViewAllTickets,
} from '../../models/utils/role.utils';

interface DetailTimelineItem {
  title: string;
  detail: string;
  status: 'done' | 'pending' | 'risk' | 'info';
}

interface MemoryDetailItem {
  label: string;
  value: string;
  tone: 'info' | 'risk' | 'success' | 'warning' | 'neutral';
}

interface MemoryStepItem {
  label: string;
  detail: string;
  date: string;
}

@Component({
  selector: 'app-ticket-detail',
  imports: [
    CommonModule,
    FormsModule,
    Modal,
    TicketKnowledgeMapComponent,
    ActualizarTicketStepperComponent,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private repositorioRamaService = inject(RepositorioRamaService);
  private aplicativoService = inject(AplicativoService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private catalogoStore = inject(CatalogoStoreService);
  private ticketWorkflowMemoryStore = inject(TicketWorkflowMemoryStoreService);

  public ticket = signal<Ticket | null>(null);
  public aplicativosTicket = signal<AplicativoTicket[]>([]);
  public usuariosAsignables = signal<User[]>([]);
  public cargando = signal(true);
  public modalEditarAbierto = signal(false);
  public estadosDisponibles = Object.values(TicketStatus).filter(
    (estado) => estado !== TicketStatus.FINALIZADO,
  );

  public usuarioFirmaIdNumero = computed(() => Number(this.authService.currentUser()?.idUsuario ?? 0));
  public usuarioNombre = computed(() => this.authService.currentUser()?.nombres || this.authService.currentUser()?.nombreUsuario || 'Usuario');
  public memoriaTicket = computed(() => this.ticketWorkflowMemoryStore.obtener(this.ticket()?.idTicket));
  public ultimaActualizacionMemoria = computed(() =>
    this.ticketWorkflowMemoryStore.obtenerActualizacionConsolidada(this.ticket()?.idTicket),
  );
  public causaRaizPintada = computed(() =>
    this.normalizeText(this.ultimaActualizacionMemoria()?.causaRaiz ?? this.ticket()?.causaRaiz),
  );
  public solucionPintada = computed(() =>
    this.normalizeText(
      this.ultimaActualizacionMemoria()?.solucionAplicada ??
        this.ultimaActualizacionMemoria()?.solucionPropuesta ??
        this.ticket()?.solucionPropuesta,
    ),
  );
  public historiaUsuarioPintada = computed(() =>
    this.normalizeText(
      this.ultimaActualizacionMemoria()?.historiaUsuario ??
        this.ticket()?.nombreHu ??
        this.ticket()?.historiaUsuario,
    ),
  );
  public detallesMemoriaPintables = computed<MemoryDetailItem[]>(() => {
    const latest = this.ultimaActualizacionMemoria();
    if (!latest) return [];

    return [
      { label: 'Sintoma', value: latest.sintomaConfirmado, tone: 'info' },
      {
        label: 'Estado HU',
        value: latest.idEstadoHistoriaUsuario
          ? this.nombreParametro('estadosHistoriaUsuario', latest.idEstadoHistoriaUsuario)
          : null,
        tone: 'info',
      },
      { label: 'ID HU o referencia', value: latest.historiaUsuario, tone: 'info' },
      {
        label: 'Aplicacion afectada',
        value: latest.idAplicativo ? this.nombreAplicativo(latest.idAplicativo) : null,
        tone: 'info',
      },
      { label: 'URL HU', value: latest.urlHu, tone: 'info' },
      { label: 'Carpeta de medios', value: latest.carpetaMedios, tone: 'neutral' },
      { label: 'Causa raiz', value: latest.causaRaiz, tone: 'risk' },
      { label: 'Solucion propuesta', value: latest.solucionPropuesta, tone: 'success' },
      { label: 'Solucion aplicada', value: latest.solucionAplicada, tone: 'success' },
      { label: 'Pull request', value: latest.pullRequestUrl, tone: 'info' },
      { label: 'Commit', value: latest.commitId, tone: 'info' },
      { label: 'Observaciones tecnicas', value: latest.observacionesTecnicas, tone: 'neutral' },
      { label: 'Validacion QA', value: latest.observacionesQa, tone: 'success' },
      { label: 'Resumen conocimiento', value: latest.resumenConocimiento, tone: 'info' },
      { label: 'Recomendacion futura', value: latest.recomendacionFutura, tone: 'info' },
      { label: 'Tags', value: latest.tags?.join(', '), tone: 'neutral' },
      { label: 'Casos relacionados', value: latest.casosRelacionados?.join(', '), tone: 'neutral' },
      { label: 'Comentario', value: latest.comentario, tone: 'neutral' },
    ].filter((item): item is MemoryDetailItem => Boolean(this.normalizeText(item.value)));
  });
  public pasosMemoriaPintables = computed<MemoryStepItem[]>(() =>
    [...(this.memoriaTicket()?.actualizaciones ?? [])]
      .reverse()
      .map((actualizacion) => ({
        label: this.nombrePasoMemoria(actualizacion.paso),
        detail: this.descripcionPasoMemoria(actualizacion),
        date: actualizacion.fechaActualizacion,
      })),
  );
  public progresoConocimiento = computed(() => {
    const ticket = this.ticket();
    const latest = this.ultimaActualizacionMemoria();
    if (!ticket) return { completed: 0, total: 5, label: '0/5' };

    const checks = [
      Boolean(ticket.descripcion?.trim()),
      Boolean((latest?.causaRaiz ?? ticket.causaRaiz)?.trim()),
      Boolean((latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta)?.trim()),
      Boolean(latest?.idResultadoValidacion || latest?.observacionesQa?.trim()),
      Boolean(latest?.resumenConocimiento?.trim()),
    ];
    const completed = checks.filter(Boolean).length;
    return { completed, total: checks.length, label: `${completed}/${checks.length}` };
  });
  public lineaVida = computed<DetailTimelineItem[]>(() => {
    const ticket = this.ticket();
    const latest = this.ultimaActualizacionMemoria();
    if (!ticket) return [];

    return [
      {
        title: 'Caso recibido',
        detail: ticket.codigoCaso,
        status: 'done',
      },
      {
        title: 'Estado operativo',
        detail: ticket.estadoActual,
        status: 'info',
      },
      {
        title: 'Diagnostico',
        detail: (latest?.causaRaiz ?? ticket.causaRaiz)?.trim() || 'Pendiente de causa raiz',
        status: (latest?.causaRaiz ?? ticket.causaRaiz)?.trim() ? 'done' : 'risk',
      },
      {
        title: 'Solucion',
        detail: (latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta)?.trim() || 'Pendiente de solucion',
        status: (latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta)?.trim() ? 'done' : 'pending',
      },
      {
        title: 'Validacion',
        detail: latest?.observacionesQa?.trim() || 'Sin resultado de validacion',
        status: latest?.idResultadoValidacion || latest?.observacionesQa?.trim() ? 'done' : 'pending',
      },
      {
        title: 'Conocimiento',
        detail: latest?.resumenConocimiento?.trim() || 'Pendiente de documentar',
        status: latest?.resumenConocimiento?.trim() ? 'done' : 'pending',
      },
    ];
  });
  public puedeReasignarTickets = computed(() => canReassignTickets(this.authService.currentRole()));
  public puedeEditarDefinicionTicket = computed(() => canEditTicketDefinition(this.authService.currentRole()));

  ngOnInit(): void {
    this.cargarUsuarios();
    this.route.paramMap.subscribe((params) => {
      const idTicket = params.get('id');
      if (idTicket) this.cargarTicket(idTicket);
    });

    this.route.queryParamMap.subscribe((params) => {
      if (params.get('editar') === '1') {
        this.modalEditarAbierto.set(true);
      }
    });
  }

  volverDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  abrirActualizacion(): void {
    this.modalEditarAbierto.set(true);
  }

  cerrarActualizacion(): void {
    this.modalEditarAbierto.set(false);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  puedeCambiarEstado(ticket: Ticket | null): boolean {
    if (!ticket) return false;
    const role = this.authService.currentRole();
    if (role === Roles.Product_Owner || role === Roles.Lider_Tecnico) return true;
    return Number(ticket.idUsuarioAsignado) === this.usuarioFirmaIdNumero();
  }

  puedeEditarDiagnosticoTicket(ticket: Ticket | null): boolean {
    if (!ticket) return false;
    const role = this.authService.currentRole();
    const esAsignado = Number(ticket.idUsuarioAsignado) === this.usuarioFirmaIdNumero();
    return role === Roles.Desarrollador && esAsignado;
  }

  obtenerColorEstado(estado: TicketStatus | string | undefined): string {
    if (!estado) return 'bg-[#0e0e12] text-slate-400 border border-slate-500/20';
    return StatusColors[estado] || 'bg-[#0e0e12] text-slate-400 border border-slate-500/20';
  }

  obtenerNombreUsuarioAsignado(ticket: Ticket | null): string {
    if (!ticket || !ticket.idUsuarioAsignado) return 'Sin asignar';
    const usuario = this.buscarUsuarioPorId(ticket.idUsuarioAsignado);
    return usuario ? this.formatearNombreUsuario(usuario) : ticket.desarrolladorAsignadoNombre ?? 'Usuario no disponible';
  }

  obtenerRolUsuarioAsignado(ticket: Ticket | null): string {
    return this.buscarUsuarioPorId(ticket?.idUsuarioAsignado)?.rol ?? 'No disponible';
  }

  nombreParametro(key: TicketCatalogoKey, idParametro: number | null | undefined): string {
    if (!idParametro) return 'Sin definir';
    return this.catalogoStore.findById(key, idParametro)?.nombre ?? 'Sin definir';
  }

  nombreAplicativo(idAplicativo: string | null | undefined): string {
    if (!idAplicativo) return 'Sin definir';
    return (
      this.catalogoStore
        .getCatalogo('aplicativos')
        .find((aplicativo) => aplicativo.valor === idAplicativo)?.nombre ?? 'Sin definir'
    );
  }

  estadoHu(ticket: Ticket | null): string {
    const latest = this.ultimaActualizacionMemoria();
    if (latest?.idEstadoHistoriaUsuario) {
      return this.nombreParametro('estadosHistoriaUsuario', latest.idEstadoHistoriaUsuario);
    }
    if (latest?.historiaUsuario?.trim()) return 'Documentada';

    const memoria = this.memoriaTicket();
    if (memoria?.creacion.idEstadoHistoriaUsuario) {
      return this.nombreParametro('estadosHistoriaUsuario', memoria.creacion.idEstadoHistoriaUsuario);
    }
    return (ticket?.nombreHu ?? ticket?.historiaUsuario)?.trim() ? 'Documentada' : 'Pendiente';
  }

  timelineClass(status: DetailTimelineItem['status']): string {
    const classes: Record<DetailTimelineItem['status'], string> = {
      done: 'bg-emerald-400',
      pending: 'bg-slate-500',
      risk: 'bg-rose-400',
      info: 'bg-blue-400',
    };
    return classes[status];
  }

  memoryDetailClass(tone: MemoryDetailItem['tone']): string {
    const classes: Record<MemoryDetailItem['tone'], string> = {
      info: 'border-blue-400/15 bg-blue-500/[0.04] text-blue-100',
      risk: 'border-rose-400/15 bg-rose-500/[0.04] text-rose-100',
      success: 'border-emerald-400/15 bg-emerald-500/[0.04] text-emerald-100',
      warning: 'border-amber-400/15 bg-amber-500/[0.04] text-amber-100',
      neutral: 'border-white/10 bg-white/[0.03] text-slate-200',
    };
    return classes[tone];
  }

  procesarActualizacionTicket(payload: ActualizarTicketStepSave): void {
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
        `ticket-detail-memory-${payload.updatedTicket.idTicket}-${payload.paso}`,
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
            `ticket-detail-backend-${updated.idTicket}-${payload.paso}`,
            'Seccion actualizada',
            'El backend recibio los campos compatibles y la memoria guardo el resto.',
          );
        },
        error: () => {
          this.aplicarTicketActualizado(payload.updatedTicket);
          this.toastService.warning(
            `ticket-detail-local-${payload.updatedTicket.idTicket}-${payload.paso}`,
            'Seccion guardada en memoria',
            'El backend no recibio esta actualizacion. El cambio vive solo en esta sesion.',
          );
        },
      });
  }

  private cargarTicket(idTicket: string): void {
    this.cargando.set(true);
    const localTicket = this.ticketWorkflowMemoryStore.obtenerTicketTemporal(idTicket);
    if (localTicket) {
      this.ticket.set(this.enriquecerTicket(localTicket));
      this.cargando.set(false);
      return;
    }

    this.ticketService.getTicketById(idTicket).subscribe({
      next: (ticket) => {
        this.ticket.set(this.enriquecerTicket(this.ticketWorkflowMemoryStore.aplicarMemoria(ticket)));
        this.cargarAplicativosTicket(ticket.idTicket);
        this.cargarRamasTicket(ticket.idTicket);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.toastService.error(
          `ticket-detail-error-${idTicket}`,
          'No fue posible cargar el ticket',
          'Regresa al dashboard e intenta nuevamente.',
        );
      },
    });
  }

  private cargarUsuarios(): void {
    if (canViewAllTickets(this.authService.currentRole())) {
      this.userService.getUsers().subscribe({
        next: (users) => this.usuariosAsignables.set(users.filter((user) => user.activo && !user.bloqueado)),
      });
      return;
    }

    const currentUser = this.authService.currentUser();
    this.usuariosAsignables.set(currentUser ? [currentUser] : []);
  }

  private aplicarTicketActualizado(ticket: Ticket): void {
    this.ticket.set(this.enriquecerTicket(this.ticketWorkflowMemoryStore.aplicarMemoria(ticket)));
  }

  private asignarDependenciasTicket(payload: ActualizarTicketStepSave): void {
    if (!this.puedeReasignarTickets() || payload.updatedTicket.idTicket.startsWith('local-')) return;

    if (payload.aplicativoAsignado) {
      this.aplicativoService
        .asignarAplicativoTicket(payload.updatedTicket.idTicket, payload.aplicativoAsignado.idAplicativo)
        .subscribe({
          next: () => {
            this.cargarAplicativosTicket(payload.updatedTicket.idTicket);
            this.toastService.success(
              `ticket-app-${payload.updatedTicket.idTicket}-${payload.aplicativoAsignado?.idAplicativo}`,
              'Aplicacion asociada',
              'La aplicacion quedo vinculada al ticket.',
            );
          },
          error: () => {
            this.toastService.warning(
              `ticket-app-error-${payload.updatedTicket.idTicket}-${payload.aplicativoAsignado?.idAplicativo}`,
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
          this.cargarRamasTicket(payload.updatedTicket.idTicket);
          this.toastService.success(
            `ticket-rama-${payload.updatedTicket.idTicket}-${payload.ramaAsignada?.idRama}`,
            'Rama asociada',
            'El repositorio quedo vinculado al ticket.',
          );
        },
        error: () => {
          this.toastService.warning(
            `ticket-rama-error-${payload.updatedTicket.idTicket}-${payload.ramaAsignada?.idRama}`,
            'No se asocio la rama',
            'Revisa que el ticket sea de desarrollo y que la rama no este duplicada.',
          );
        },
      });
  }

  private cargarRamasTicket(idTicket: string): void {
    if (idTicket.startsWith('local-')) return;

    this.repositorioRamaService.getRamasTicket(idTicket).subscribe({
      next: (ramas) => {
        this.ticket.update((ticket) =>
          ticket
            ? {
                ...ticket,
                repositoriosAfectados: ramas.map((rama) => this.mapRamaTicketRepositorio(rama)),
              }
            : ticket,
        );
      },
    });
  }

  private cargarAplicativosTicket(idTicket: string): void {
    if (idTicket.startsWith('local-')) return;

    this.aplicativoService.getAplicativosTicket(idTicket).subscribe({
      next: (aplicativos) => this.aplicativosTicket.set(aplicativos),
    });
  }

  private mapRamaTicketRepositorio(rama: RamaTicketDetalle) {
    return {
      idRepositorio: rama.idRepositorio,
      repositorio: rama.repositorio,
      link: '',
      descripcion: `Rama ${rama.rama}`,
      idRama: rama.idRama,
      rama: rama.rama,
      idRamaTicket: rama.idRamaTicket,
    };
  }

  private enriquecerTicket(ticket: Ticket): Ticket {
    const usuario = this.buscarUsuarioPorId(ticket.idUsuarioAsignado);
    return {
      ...ticket,
      desarrolladorAsignadoNombre: usuario ? this.formatearNombreUsuario(usuario) : ticket.desarrolladorAsignadoNombre,
    };
  }

  private buscarUsuarioPorId(idUsuario: number | string | null | undefined): User | undefined {
    if (!idUsuario) return undefined;
    return this.usuariosAsignables().find((usuario) => Number(usuario.idUsuario) === Number(idUsuario));
  }

  private formatearNombreUsuario(usuario: User): string {
    return `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.nombreUsuario;
  }

  private normalizeText(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private nombrePasoMemoria(paso: string): string {
    const labels: Record<string, string> = {
      definicion: 'Definicion',
      asignacion: 'Gestion',
      diagnostico: 'Diagnostico',
      solucion: 'Solucion',
      validacion: 'Validacion',
      conocimiento: 'Conocimiento',
    };
    return labels[paso] ?? paso;
  }

  private descripcionPasoMemoria(actualizacion: { paso: string; comentario?: string | null }): string {
    return actualizacion.comentario?.trim() || `Se guardo la seccion ${this.nombrePasoMemoria(actualizacion.paso)} en memoria.`;
  }
}
