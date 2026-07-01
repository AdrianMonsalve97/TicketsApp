import { Component, input } from '@angular/core';
import { StatusColors } from '../../../models/constants/status-colors';
import { TicketStatus } from '../../../models/enums/ticket-status';

@Component({
  selector: 'app-badge-estado',
  imports: [],
  templateUrl: './badge-estado.html',
  styleUrl: 'badge-estado.css'
})
export class BadgeEstadoComponent {
  status = input.required<TicketStatus>();

  get labelFormateada(): string {
    const status = this.status();
    if (!status) return '';
    return status.replace(/_/g, ' ');
  }

  get badgeClass(): string {
    const status = this.status();
    if (!status) return 'bg-gray-100 text-gray-600';
    return StatusColors[status] || 'bg-gray-100 text-gray-600';
  }
}
