import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Ticket } from '../../../models/interfaces/ticket.model';
import { BadgeEstadoComponent } from '../../atoms/badge-estado/badge-estado';
import { StatusColors } from '../../../models/constants/status-colors';

@Component({
  selector: 'app-ticket-card',
  imports: [CommonModule, DatePipe, BadgeEstadoComponent],
  templateUrl: './ticket-card.html',
  styleUrl: './ticket-card.css',
})
export class TicketCard {
  ticket = input.required<Ticket>();

  private getBaseColorName(): string {
    const ticket = this.ticket();
    if (!ticket || !ticket.estadoActual) return 'slate';
    const badgeClasses = StatusColors[ticket.estadoActual] || '';

    const match = badgeClasses.match(/(?:bg|text|border)-([a-z]+)-\d+/);
    return match ? match[1] : 'slate';
  }

  get glowClass(): string {
    const color = this.getBaseColorName();
    return `from-${color}-500/20 to-transparent`;
  }

  get statusBorderClass(): string {
    const color = this.getBaseColorName();
    return `border-${color}-900/50`;
  }
}
