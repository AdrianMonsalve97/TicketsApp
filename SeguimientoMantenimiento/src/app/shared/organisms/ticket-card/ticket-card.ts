import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Ticket } from '../../../models/interfaces/ticket.model';
import { BadgeEstadoComponent } from '../../atoms/badge-estado/badge-estado';
import { StatusColors } from '../../../models/constants/status-colors';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [CommonModule, DatePipe, BadgeEstadoComponent],
  templateUrl: './ticket-card.html',
  styleUrl: './ticket-card.css',
})
export class TicketCard {
  @Input({ required: true }) ticket!: Ticket;

  private getBaseColorName(): string {
    if (!this.ticket || !this.ticket.estadoActual) return 'slate';
    const badgeClasses = StatusColors[this.ticket.estadoActual] || '';

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
