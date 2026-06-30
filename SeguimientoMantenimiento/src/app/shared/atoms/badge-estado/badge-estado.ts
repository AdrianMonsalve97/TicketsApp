import { Component, Input } from '@angular/core';
import { StatusColors } from '../../../models/constants/status-colors';
import { TicketStatus } from '../../../models/enums/ticket-status';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [],
  templateUrl: './badge-estado.html',
  styleUrl: 'badge-estado.css'
})
export class BadgeEstadoComponent {
  @Input({ required: true }) status!: TicketStatus;

  get labelFormateada(): string {
    if (!this.status) return '';
    return this.status.replace(/_/g, ' ');
  }

  get badgeClass(): string {
    if (!this.status) return 'bg-gray-100 text-gray-600';
    return StatusColors[this.status] || 'bg-gray-100 text-gray-600';
  }
}
