import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    const fallbackClasses =
      'bg-[#0e0e12] text-slate-400 border border-slate-500/20 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-block';
    if (estado === undefined || estado === null) return fallbackClasses;

    if (typeof estado === 'boolean') {
      return estado
        ? 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block'
        : 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';
    }
    if (estado === 'PRODUCT OWNER')
      return 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';
    if (estado === 'LIDER TECNICO')
      return 'bg-[#1a1108] text-[#fed7aa] border border-[#f97316]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';
    if (estado === 'DESARROLLADOR')
      return 'bg-[#090814] text-[#a5b4fc] border border-[#6366f1]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';
    if (estado === 'QA')
      return 'bg-[#081a18] text-[#99f6e4] border border-[#14b8a6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

    switch (estado.toString().toUpperCase()) {
      case 'EN PROCESO':
      case 'EN ANALISIS':
      case 'EN_PROCESO':
      case 'EN_ANALISIS':
        return 'bg-[#080d1a] text-[#a9c7ff] border border-[#3b82f6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'BLOQUEO':
      case 'ROLLBACK':
        return 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'CERTIFICADO':
      case 'DESPLIEGUE A PRODUCCION':
      case 'DESPLIEGUE_A_PRODUCCION':
      case 'FINALIZADO':
        return 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'DESPLIEGUE A DESARROLLO':
      case 'DESPLIEGUE_A_DESARROLLO':
        return 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'EN REVISION DESARROLLO':
      case 'EN_REVISION_DESARROLLO':
      case 'EN REVISION QA':
      case 'EN_REVISION_QA':
        return 'bg-[#1a1908] text-[#fef08a] border border-[#eab308]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'APROBADO PARA QA':
      case 'APROBADO_PARA_QA':
      case 'DESPLIEGUE A QA':
      case 'DESPLIEGUE_A_QA':
        return 'bg-[#081a18] text-[#99f6e4] border border-[#14b8a6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'PENDIENTE CERTIFICACION':
      case 'PENDIENTE_CERTIFICACION':
        return 'bg-[#1a1108] text-[#fed7aa] border border-[#f97316]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      case 'DEVUELTO':
        return 'bg-[#1a0814] text-[#fbcfe8] border border-[#ec4899]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block';

      default:
        return fallbackClasses;
    }
  }

  public tieneFugaInformacion(item: any): boolean {
    if (!item || !('idTicket' in item)) return false;
    return !item.historiaUsuario || item.historiaUsuario.trim() === '';
  }
}
