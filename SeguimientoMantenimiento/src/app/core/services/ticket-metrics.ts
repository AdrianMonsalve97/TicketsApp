import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';

export interface ChartMetrics {
  totalTickets: number;
  urgentesSinHU: number;
  urgentesConHU: number;
  totalSinHU: number;
  enDesarrollo: number;
  enQA: number;
  certificados: number;
  bloqueados: number;

  // Dev metrics
  tckAsignadosDev: number;
  tckActivosWIPDev: number;
  tckDevueltosDev: number;
  tckBloqueadosDev: number;
  kpiTasaRetrabajoDev: number;
  kpiEficienciaSprintDev: number;
  kpiRatioBloqueosDev: number;

  // QA metrics
  tckPendientesQA: number;
  kpiIndiceRechazoQA: number;
  kpiEficienciaCertificacion: number;
  tckCriticosBloqueantesQA: number;
  tckFuncionalesMayoresQA: number;
  
  // Sparkline data helpers
  misTicketsCount: {
    cEnProgreso: number;
    cEnRevision: number;
    cEnQA: number;
    cReabiertos: number;
    cBloqueados: number;
    cFinalizados: number;
  };
}

export function calculateMetrics(data: Ticket[], usuarioFirmaId: string): ChartMetrics {
  const totalTickets = data.length;
  const withoutHU = data.filter((t) => !t.historiaUsuario || t.historiaUsuario.trim() === '');
  const urgentesSinHU = withoutHU.filter((t) =>
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
    ].includes(t.estadoActual),
  ).length;
  const urgentesConHU = data.filter(
    (t) =>
      !!t.historiaUsuario?.trim() &&
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
      ].includes(t.estadoActual),
  ).length;

  const enDesarrollo = data.filter((t) =>
    [
      TicketStatus.EN_ANALISIS,
      TicketStatus.EN_PROCESO,
      TicketStatus.EN_REVISION_DESARROLLO,
    ].includes(t.estadoActual)
  ).length;

  const enQA = data.filter((t) =>
    [
      TicketStatus.APROBADO_PARA_QA,
      TicketStatus.DESPLIEGUE_A_QA,
      TicketStatus.EN_REVISION_QA,
      TicketStatus.APROBADO_QA,
      TicketStatus.PENDIENTE_CERTIFICACION,
    ].includes(t.estadoActual)
  ).length;

  const certificados = data.filter((t) =>
    [
      TicketStatus.CERTIFICADO,
      TicketStatus.FINALIZADO,
      TicketStatus.DESPLIEGUE_A_PRODUCCION,
    ].includes(t.estadoActual)
  ).length;

  const bloqueados = data.filter((t) =>
    [TicketStatus.BLOQUEO, TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual)
  ).length;

  const misTickets = data.filter((t) => String(t.idUsuarioAsignado) === String(usuarioFirmaId));
  const tckAsignadosDev = misTickets.length;
  const tckActivosWIPDev = misTickets.filter((t) =>
    [TicketStatus.EN_ANALISIS, TicketStatus.EN_PROCESO].includes(t.estadoActual)
  ).length;
  const tckDevueltosDev = misTickets.filter((t) =>
    [TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual)
  ).length;
  const tckBloqueadosDev = misTickets.filter(
    (t) => t.estadoActual === TicketStatus.BLOQUEO
  ).length;

  const misFinalizados = misTickets.filter((t) =>
    [
      TicketStatus.CERTIFICADO,
      TicketStatus.FINALIZADO,
      TicketStatus.DESPLIEGUE_A_PRODUCCION,
    ].includes(t.estadoActual)
  ).length;

  const kpiTasaRetrabajoDev =
    tckAsignadosDev > 0 ? Math.round((tckDevueltosDev / tckAsignadosDev) * 100) : 0;
  const kpiEficienciaSprintDev =
    tckAsignadosDev > 0 ? Math.round((misFinalizados / tckAsignadosDev) * 100) : 0;
  const kpiRatioBloqueosDev =
    tckAsignadosDev > 0 ? Math.round((tckBloqueadosDev / tckAsignadosDev) * 100) : 0;

  const tckPendientesQA = data.filter((t) =>
    [
      TicketStatus.APROBADO_PARA_QA,
      TicketStatus.DESPLIEGUE_A_QA,
      TicketStatus.EN_REVISION_QA,
      TicketStatus.APROBADO_QA,
      TicketStatus.PENDIENTE_CERTIFICACION,
    ].includes(t.estadoActual)
  ).length;
  const poolQA = tckPendientesQA + certificados;
  const kpiEficienciaCertificacion =
    poolQA > 0 ? Math.round((certificados / poolQA) * 100) : 0;
  const kpiIndiceRechazoQA = poolQA > 0 ? Math.round((bloqueados / poolQA) * 100) : 0;
  const tckCriticosBloqueantesQA = data.filter(
    (t) => t.estadoActual === TicketStatus.BLOQUEO
  ).length;
  const tckFuncionalesMayoresQA = data.filter(
    (t) => t.estadoActual === TicketStatus.DEVUELTO
  ).length;

  // Helpers de counts
  const cEnProgreso = misTickets.filter((t) =>
    [TicketStatus.EN_ANALISIS, TicketStatus.EN_PROCESO].includes(t.estadoActual)
  ).length;
  const cEnRevision = misTickets.filter(
    (t) => t.estadoActual === TicketStatus.EN_REVISION_DESARROLLO
  ).length;
  const cEnQA = misTickets.filter((t) =>
    [
      TicketStatus.APROBADO_PARA_QA,
      TicketStatus.DESPLIEGUE_A_QA,
      TicketStatus.EN_REVISION_QA,
      TicketStatus.APROBADO_QA,
      TicketStatus.PENDIENTE_CERTIFICACION,
    ].includes(t.estadoActual)
  ).length;
  const cReabiertos = misTickets.filter((t) =>
    [TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual)
  ).length;
  const cBloqueados = misTickets.filter((t) => t.estadoActual === TicketStatus.BLOQUEO).length;
  const cFinalizados = misTickets.filter((t) =>
    [
      TicketStatus.CERTIFICADO,
      TicketStatus.FINALIZADO,
      TicketStatus.DESPLIEGUE_A_PRODUCCION,
    ].includes(t.estadoActual)
  ).length;

  return {
    totalTickets,
    urgentesSinHU,
    urgentesConHU,
    totalSinHU: withoutHU.length,
    enDesarrollo,
    enQA,
    certificados,
    bloqueados,
    tckAsignadosDev,
    tckActivosWIPDev,
    tckDevueltosDev,
    tckBloqueadosDev,
    kpiTasaRetrabajoDev,
    kpiEficienciaSprintDev,
    kpiRatioBloqueosDev,
    tckPendientesQA,
    kpiIndiceRechazoQA,
    kpiEficienciaCertificacion,
    tckCriticosBloqueantesQA,
    tckFuncionalesMayoresQA,
    misTicketsCount: {
      cEnProgreso,
      cEnRevision,
      cEnQA,
      cReabiertos,
      cBloqueados,
      cFinalizados
    }
  };
}
