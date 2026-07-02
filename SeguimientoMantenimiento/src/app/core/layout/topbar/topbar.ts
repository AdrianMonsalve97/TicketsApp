import { Component, OnInit, inject, viewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { UserService } from '../../services/user.service';
import { Ticket } from '../../../models/interfaces/ticket.model';
import { Roles } from '../../../models/enums/roles';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PopoverModule, Popover } from 'primeng/popover';



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

  get selectedRole(): Roles {
    return this.authService.currentRole();
  }

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
    if (!this.authService.currentUser()) return;
    const role = this.authService.currentRole();
    const request$ = role === Roles.Product_Owner ? this.ticketService.getTickets() : this.ticketService.getMyTickets();
    this.userService.getUsers().subscribe({
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

  private buildNotificaciones(tickets: Ticket[], usuariosPorId: Map<number, any>): NotificationItem[] {
    const recientes = [...tickets]
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
          title: ticket.causaRaiz?.trim() ? 'Ticket actualizado' : 'Ticket reciente',
          detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
          meta: usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : 'Sin asignar',
          time: this.formatRelativeDate(ticket.fechaUltimaActualizacion ?? ticket.fechaCreacion),
          tone: 'info' as const,
        };
      });

    const urgentesSinHU = tickets
      .filter((ticket) => !ticket.historiaUsuario || ticket.historiaUsuario.trim() === '')
      .filter((ticket) =>
        [ 'EN ANALISIS', 'EN PROCESO', 'BLOQUEO', 'EN REVISION DESARROLLO', 'APROBADO PARA QA', 'DESPLIEGUE A QA', 'EN REVISION QA', 'PENDIENTE CERTIFICACION' ]
          .includes(ticket.estadoActual),
      )
      .slice(0, 2)
      .map((ticket) => ({
        title: 'Urgente sin HU',
        detail: `${ticket.codigoCaso} - ${ticket.titulo}`,
        meta: 'Requiere historia de usuario',
        time: this.formatRelativeDate(ticket.fechaCreacion),
        tone: 'warning' as const,
      }));

    return [...urgentesSinHU, ...recientes].slice(0, 5);
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
  title: string;
  detail: string;
  meta: string;
  time: string;
  tone: 'info' | 'warning';
}
