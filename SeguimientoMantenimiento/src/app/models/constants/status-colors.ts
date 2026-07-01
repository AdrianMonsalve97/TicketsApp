import { TicketStatus } from '../enums/ticket-status';

export const StatusColors: Record<string, string> = {
  // Roles de usuario
  'PRODUCT OWNER': 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  'LIDER TECNICO': 'bg-[#1a1108] text-[#fed7aa] border border-[#f97316]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  'DESARROLLADOR': 'bg-[#090814] text-[#a5b4fc] border border-[#6366f1]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  'QA': 'bg-[#081a18] text-[#99f6e4] border border-[#14b8a6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  // Estados de Tickets
  [TicketStatus.EN_PROCESO]: 'bg-[#080d1a] text-[#a9c7ff] border border-[#3b82f6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.EN_ANALISIS]: 'bg-[#080d1a] text-[#a9c7ff] border border-[#3b82f6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.ENTREGADO_A_LT]: 'bg-[#080d1a] text-[#a9c7ff] border border-[#3b82f6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  
  [TicketStatus.BLOQUEO]: 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.ROLLBACK]: 'bg-[#1a080d] text-[#ff6b8b] border border-[#ef4444]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.CERTIFICADO]: 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.DESPLIEGUE_A_PRODUCCION]: 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.FINALIZADO]: 'bg-[#081a10] text-[#a7f3d0] border border-[#10b981]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.DESPLIEGUE_A_DESARROLLO]: 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.DESPLIEGUE_A_QA]: 'bg-[#14081a] text-[#e9d5ff] border border-[#a855f7]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.EN_REVISION_DESARROLLO]: 'bg-[#1a1908] text-[#fef08a] border border-[#eab308]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
  [TicketStatus.EN_REVISION_QA]: 'bg-[#1a1908] text-[#fef08a] border border-[#eab308]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.APROBADO_PARA_QA]: 'bg-[#081a18] text-[#99f6e4] border border-[#14b8a6]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.PENDIENTE_CERTIFICACION]: 'bg-[#1a1108] text-[#fed7aa] border border-[#f97316]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',

  [TicketStatus.DEVUELTO]: 'bg-[#1a0814] text-[#fbcfe8] border border-[#ec4899]/40 font-mono tracking-wide px-2 py-0.5 rounded text-[10px] font-bold inline-block',
};

