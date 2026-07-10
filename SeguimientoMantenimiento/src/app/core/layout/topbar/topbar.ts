import { Component, OnInit, inject, viewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { UserService } from '../../services/user.service';
import { Ticket } from '../../../models/interfaces/ticket.model';
import { User } from '../../../models/interfaces/user.model';
import { Roles } from '../../../models/enums/roles';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PopoverModule, Popover } from 'primeng/popover';
import { of } from 'rxjs';
import { TicketStatus } from '../../../models/enums/ticket-status';
import { canViewAllTickets } from '../../../models/utils/role.utils';



@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    OverlayBadge,
    BadgeModule,
    ButtonModule,
    PopoverModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private authService = inject(AuthService);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private router = inject(Router);
  popoverComponent = viewChild<Popover>('op');
  isDarkMode: boolean = true;
  public notificaciones = signal<NotificationItem[]>([]);
  public cantidadNotificaciones = computed(() => this.notificaciones().length);
  public currentUser = computed(() => this.authService.currentUser());

  get selectedRole(): Roles {
    return this.authService.currentRole();
  }

  public avatarUrl = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    if (user.avatarUrl) return user.avatarUrl;
    if (user.imagenPerfilBase64) {
      return user.imagenPerfilBase64.startsWith('data:')
        ? user.imagenPerfilBase64
        : `data:image/png;base64,${user.imagenPerfilBase64}`;
    }
    return '';
  });
  public avatarFallback = computed(() =>
    (this.authService.currentUser()?.nombres || this.authService.currentUser()?.nombreUsuario || 'U')
      .trim()
      .slice(0, 2)
      .toUpperCase()
  );

  onRoleChange(newRole: Roles) {
    this.authService.changeRole(newRole);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (!this.isDarkMode) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }

  alternarPopover(event: Event) {
    this.popoverComponent()?.toggle(event);
  }

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.cargarNotificaciones();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private cargarNotificaciones(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;
    const role = this.authService.currentRole();
    const request$ = canViewAllTickets(role)
      ? this.ticketService.getTickets()
      : this.ticketService.getMyTickets();
    const users$ = canViewAllTickets(role) ? this.userService.getUsers() : of([currentUser]);

    users$.subscribe({
      next: (users) => {
        const usuariosPorId = new Map(users.map((user) => [Number(user.idUsuario), user]));
        request$.subscribe({
          next: (tickets) => {
            this.notificaciones.set(this.buildNotificaciones(tickets, usuariosPorId));
          },
        });
      },
    });
  }

  private buildNotificaciones(tickets: Ticket[], usuariosPorId: Map<number, User>): NotificationItem[] {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    const role = this.authService.currentRole();
    const notificaciones = [
      ...this.buildAlertasSinHu(tickets, usuariosPorId, role),
      ...this.buildNotificacionesPorRol(tickets, usuariosPorId, currentUser, role),
      ...this.buildRecientes(tickets, usuariosPorId, role),
    ];

    return this.takeUniqueNotifications(notificaciones, 5);
  }

  private buildAlertasSinHu(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
    role: Roles,
  ): NotificationItem[] {
    return tickets
      .filter((ticket) => this.esUrgenteSinHu(ticket))
      .sort((a, b) => this.fechaReferencia(b).getTime() - this.fechaReferencia(a).getTime())
      .slice(0, role === Roles.Product_Owner ? 3 : 1)
      .map((ticket) => ({
        id: `hu-${ticket.idTicket}`,
        title: role === Roles.Product_Owner ? 'Urgente sin HU' : 'Tu ticket requiere HU',
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaCreacion),
        tone: 'warning' as const,
      }));
  }

  private buildNotificacionesPorRol(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
    currentUser: User,
    role: Roles,
  ): NotificationItem[] {
    if (role === Roles.Product_Owner) {
      return this.buildNotificacionesPlanner(tickets, usuariosPorId);
    }

    if (role === Roles.Lider_Tecnico) {
      return this.buildNotificacionesLiderTecnico(tickets, usuariosPorId);
    }

    if (role === Roles.Qa) {
      return this.buildNotificacionesQa(tickets, usuariosPorId);
    }

    return this.buildNotificacionesDesarrollador(tickets, usuariosPorId, currentUser);
  }

  private buildNotificacionesPlanner(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
  ): NotificationItem[] {
    const bloqueados = tickets
      .filter((ticket) => [TicketStatus.BLOQUEO, TicketStatus.ROLLBACK].includes(ticket.estadoActual))
      .slice(0, 2)
      .map((ticket) => ({
        id: `planner-bloqueo-${ticket.idTicket}`,
        title: 'Bloqueo en el flujo',
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
        tone: 'warning' as const,
      }));

    const pendientesCertificacion = tickets
      .filter((ticket) => ticket.estadoActual === TicketStatus.PENDIENTE_CERTIFICACION)
      .slice(0, 2)
      .map((ticket) => ({
        id: `planner-certificacion-${ticket.idTicket}`,
        title: 'Pendiente de certificación',
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
        tone: 'info' as const,
      }));

    return [...bloqueados, ...pendientesCertificacion];
  }

  private buildNotificacionesLiderTecnico(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
  ): NotificationItem[] {
    return tickets
      .filter((ticket) =>
        [
          TicketStatus.ENTREGADO_A_LT,
          TicketStatus.APROBADO_PARA_QA,
          TicketStatus.APROBADO_QA,
          TicketStatus.BLOQUEO,
          TicketStatus.ROLLBACK,
        ].includes(ticket.estadoActual),
      )
      .slice(0, 3)
      .map((ticket) => ({
        id: `lt-${ticket.estadoActual}-${ticket.idTicket}`,
        title: this.obtenerTituloLt(ticket.estadoActual),
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
        tone: [TicketStatus.BLOQUEO, TicketStatus.ROLLBACK].includes(ticket.estadoActual)
          ? 'warning' as const
          : 'info' as const,
      }));
  }

  private buildNotificacionesQa(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
  ): NotificationItem[] {
    return tickets
      .filter((ticket) =>
        [
          TicketStatus.DESPLIEGUE_A_DESARROLLO,
          TicketStatus.EN_REVISION_DESARROLLO,
          TicketStatus.DESPLIEGUE_A_QA,
          TicketStatus.EN_REVISION_QA,
          TicketStatus.BLOQUEO,
          TicketStatus.DEVUELTO,
        ].includes(ticket.estadoActual),
      )
      .slice(0, 3)
      .map((ticket) => ({
        id: `qa-${ticket.estadoActual}-${ticket.idTicket}`,
        title: this.obtenerTituloQa(ticket.estadoActual),
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
        tone: [TicketStatus.BLOQUEO, TicketStatus.DEVUELTO].includes(ticket.estadoActual)
          ? 'warning' as const
          : 'info' as const,
      }));
  }

  private buildNotificacionesDesarrollador(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
    currentUser: User,
  ): NotificationItem[] {
    const currentUserId = Number(currentUser.idUsuario);
    return tickets
      .filter((ticket) => Number(ticket.idUsuarioAsignado) === currentUserId)
      .filter((ticket) =>
        [
          TicketStatus.EN_ANALISIS,
          TicketStatus.EN_PROCESO,
          TicketStatus.BLOQUEO,
          TicketStatus.DEVUELTO,
          TicketStatus.ROLLBACK,
        ].includes(ticket.estadoActual) ||
        this.tieneDiagnosticoPendiente(ticket),
      )
      .slice(0, 3)
      .map((ticket) => ({
        id: `dev-${ticket.estadoActual}-${ticket.idTicket}`,
        title: this.obtenerTituloDesarrollador(ticket),
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: this.obtenerMetaAsignacion(ticket, usuariosPorId),
        time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
        tone: [TicketStatus.BLOQUEO, TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(ticket.estadoActual)
          ? 'warning' as const
          : 'info' as const,
      }));
  }

  private buildRecientes(
    tickets: Ticket[],
    usuariosPorId: Map<number, User>,
    role: Roles,
  ): NotificationItem[] {
    return [...tickets]
      .filter((ticket) => !!ticket.fechaUltimaActualizacion || !!ticket.fechaCreacion)
      .sort((a, b) => {
        const aDate = a.fechaUltimaActualizacion ?? a.fechaCreacion ?? new Date(0);
        const bDate = b.fechaUltimaActualizacion ?? b.fechaCreacion ?? new Date(0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 4)
      .map((ticket) => {
        const usuario = usuariosPorId.get(ticket.idUsuarioAsignado);
        return {
          id: `reciente-${ticket.idTicket}`,
          title: role === Roles.Product_Owner ? 'Movimiento reciente' : 'Actividad en tu ticket',
          detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
          meta: usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : 'Asignado a ti',
          time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
          tone: 'info' as const,
        };
      });
  }

  private esUrgenteSinHu(ticket: Ticket): boolean {
    return (
      !(ticket.nombreHu ?? ticket.historiaUsuario)?.trim() &&
      [
        TicketStatus.EN_ANALISIS,
        TicketStatus.EN_PROCESO,
        TicketStatus.BLOQUEO,
        TicketStatus.EN_REVISION_DESARROLLO,
        TicketStatus.APROBADO_PARA_QA,
        TicketStatus.DESPLIEGUE_A_QA,
        TicketStatus.EN_REVISION_QA,
        TicketStatus.APROBADO_QA,
        TicketStatus.PENDIENTE_CERTIFICACION,
      ].includes(ticket.estadoActual)
    );
  }

  private tieneDiagnosticoPendiente(ticket: Ticket): boolean {
    return (
      [TicketStatus.EN_PROCESO, TicketStatus.ENTREGADO_A_LT].includes(ticket.estadoActual) &&
      (!ticket.causaRaiz?.trim() || !ticket.solucionPropuesta?.trim())
    );
  }

  private obtenerTituloDesarrollador(ticket: Ticket): string {
    if (ticket.estadoActual === TicketStatus.BLOQUEO) return 'Tienes un bloqueo activo';
    if ([TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(ticket.estadoActual)) return 'Requiere corrección';
    if (this.tieneDiagnosticoPendiente(ticket)) return 'Diagnóstico pendiente';
    if (ticket.estadoActual === TicketStatus.EN_ANALISIS) return 'Listo para iniciar análisis';
    return 'Ticket asignado';
  }

  private obtenerTituloQa(estado: TicketStatus): string {
    if (estado === TicketStatus.DESPLIEGUE_A_DESARROLLO) return 'Disponible para revisión API Testing';
    if (estado === TicketStatus.EN_REVISION_DESARROLLO) return 'Revisión en curso';
    if (estado === TicketStatus.DESPLIEGUE_A_QA) return 'Disponible para revisión QA';
    if (estado === TicketStatus.EN_REVISION_QA) return 'Validación QA pendiente';
    if (estado === TicketStatus.DEVUELTO) return 'Caso devuelto a desarrollo';
    return 'Impedimento en revisión';
  }

  private obtenerTituloLt(estado: TicketStatus): string {
    if (estado === TicketStatus.ENTREGADO_A_LT) return 'Listo para despliegue API Testing';
    if (estado === TicketStatus.APROBADO_PARA_QA) return 'Listo para despliegue QA';
    if (estado === TicketStatus.APROBADO_QA) return 'Listo para producción';
    if (estado === TicketStatus.ROLLBACK) return 'Rollback requiere seguimiento';
    return 'Bloqueo requiere gestión';
  }

  private obtenerMetaAsignacion(ticket: Ticket, usuariosPorId: Map<number, User>): string {
    const usuario = usuariosPorId.get(Number(ticket.idUsuarioAsignado));
    if (!usuario) return 'Asignado a ti';
    return `${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.nombreUsuario;
  }

  private fechaReferencia(ticket: Ticket): Date {
    return ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion ?? ticket.fechaAsignacion ?? new Date(0);
  }

  private takeUniqueNotifications(notificaciones: NotificationItem[], limit: number): NotificationItem[] {
    const unique = new Map<string, NotificationItem>();
    for (const notification of notificaciones) {
      if (!unique.has(notification.id)) {
        unique.set(notification.id, notification);
      }
    }
    return [...unique.values()].slice(0, limit);
  }

  private formatRelativeDate(date?: Date): string {
    if (!date) return 'Ahora';
    const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    const hours = Math.round(diffMinutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.round(hours / 24);
    return `Hace ${days}d`;
  }
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
  time: string;
  tone: 'info' | 'warning';
}
