import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusColors } from '../../../models/constants/status-colors';
import { tieneFugaInformacion } from '../../../models/utils/ticket.utils';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'avatar' | 'code';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTableComponent {
  @Input() title: string = 'Registros';
  @Input() subtitle: string = 'Estructura de datos tabular.';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];

  @Output() onRowClick = new EventEmitter<any>();
  @Output() onFilterClick = new EventEmitter<void>();

  @Output() onVerDetalle = new EventEmitter<any>();
  @Output() onEditarTicket = new EventEmitter<any>();
  @Output() onEliminarTicket = new EventEmitter<any>();

  getNestedValue(item: any, key: string): any {
    if (!item || !key) return '';
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), item);
  }


  public obtenerClasesEstado(estado: any, item?: any): string {
    if (estado === undefined || estado === null) {
      return 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-block';
    }

    if (typeof estado === 'boolean') {
      return estado
        ? 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block'
        : 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';
    }

    const key = estado.toString().toUpperCase();
    return StatusColors[key] || 'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-block';
  }

  public tieneFugaInformacion(item: any): boolean {
    return tieneFugaInformacion(item);
  }
}
