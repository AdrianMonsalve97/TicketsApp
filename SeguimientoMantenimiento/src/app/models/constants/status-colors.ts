import { TicketStatus } from '../enums/ticket-status';

export const StatusColors: Record<TicketStatus, string> = {
  [TicketStatus.EN_ANALISIS]: 'bg-gray-200 text-gray-800 border border-gray-300',
  [TicketStatus.EN_PROCESO]: 'bg-blue-100 text-blue-800 border border-blue-300',
  [TicketStatus.ENTREGADO_A_LT]: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
  [TicketStatus.DESPLIEGUE_A_DESARROLLO]: 'bg-purple-100 text-purple-800 border border-purple-300',
  [TicketStatus.EN_REVISION_DESARROLLO]: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  [TicketStatus.APROBADO_PARA_QA]: 'bg-teal-100 text-teal-800 border border-teal-300',
  [TicketStatus.DESPLIEGUE_A_QA]: 'bg-purple-200 text-purple-900 border border-purple-400',
  [TicketStatus.EN_REVISION_QA]: 'bg-yellow-200 text-yellow-900 border border-yellow-400',
  [TicketStatus.PENDIENTE_CERTIFICACION]: 'bg-orange-100 text-orange-800 border border-orange-300',
  [TicketStatus.CERTIFICADO]: 'bg-green-100 text-green-800 border border-green-300',
  [TicketStatus.DESPLIEGUE_A_PRODUCCION]:
    'bg-emerald-200 text-emerald-900 border border-emerald-400',
  [TicketStatus.FINALIZADO]: 'bg-green-600 text-white shadow-md',
  [TicketStatus.BLOQUEO]: 'bg-red-500 text-white shadow-md animate-pulse',
  [TicketStatus.DEVUELTO]: 'bg-rose-200 text-rose-900 border border-rose-400',
  [TicketStatus.ROLLBACK]: 'bg-red-800 text-white shadow-lg font-bold',
};
