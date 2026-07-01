import { Component, effect, input } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { calculateMetrics, ChartMetrics } from '../../../core/services/ticket-metrics';
import * as factories from '../../../models/constants/chart-configs';
import { Ticket } from '../../../models/interfaces/ticket.model';

@Component({
  selector: 'app-analytics-charts',
  imports: [NgApexchartsModule],
  templateUrl: './analytics-charts.html',
  styleUrl: './analytics-charts.css',
})
export class AnalyticsChartsComponent {
  ticketsDataSource = input<Ticket[]>([]);
  usuarioRol = input<'PMO_LT' | 'DEV' | 'QA'>('PMO_LT');
  usuarioFirmaId = input('DEV-Hamilton');
  usuarioNombre = input('Usuario');

  // Configs
  public graficoTendenciaEntrada: any;
  public graficoAlertasCriticas: any;
  public graficoEstabilidadFlujo: any;
  public graficoDensidadAcumulacion: any;
  public graficoEficienciaCompromiso: any;
  public graficoResolucionIngenieros: any;
  public graficoRetrabajoDev: any;
  public graficoVelocidadCertificacionQA: any;
  public graficoDiagnosticoRadarQA: any;

  // Calculados finales para bindear en UI
  public totalTickets = 0;
  public totalSinHU = 0;
  public urgentesSinHU = 0;
  public urgentesConHU = 0;
  public enDesarrollo = 0;
  public enQA = 0;
  public certificados = 0;
  public bloqueados = 0;
  
  public tckAsignadosDev = 0;
  public tckActivosWIPDev = 0;
  public tckDevueltosDev = 0;
  public tckBloqueadosDev = 0;
  public kpiTasaRetrabajoDev = 0;
  public kpiEficienciaSprintDev = 0;
  public kpiRatioBloqueosDev = 0;

  public tckPendientesQA = 0;
  public kpiIndiceRechazoQA = 0;
  public kpiEficienciaCertificacion = 0;
  public tckCriticosBloqueantesQA = 0;
  public tckFuncionalesMayoresQA = 0;

  public tooltipActivo: { [key: string]: boolean } = {
    estabilidad: false,
    densidad: false,
    eficiencia: false,
    resolucion: false,
    retrabajo: false,
    qaVelocity: false,
  };

  constructor() {
    effect(() => {
      const ticketsDataSource = this.ticketsDataSource();
      if (ticketsDataSource) {
        const metrics = calculateMetrics(ticketsDataSource, this.usuarioFirmaId());
        this.bindMetrics(metrics);
        this.inicializarConsolaGrafica(metrics);
      }
    });
  }

  public alternarTooltip(id: string, event: Event): void {
    event.stopPropagation();
    this.tooltipActivo[id] = !this.tooltipActivo[id];
    Object.keys(this.tooltipActivo).forEach((key) => {
      if (key !== id) this.tooltipActivo[key] = false;
    });
  }

  private bindMetrics(m: ChartMetrics) {
    this.totalTickets = m.totalTickets;
    this.totalSinHU = m.totalSinHU;
    this.urgentesSinHU = m.urgentesSinHU;
    this.urgentesConHU = m.urgentesConHU;
    this.enDesarrollo = m.enDesarrollo;
    this.enQA = m.enQA;
    this.certificados = m.certificados;
    this.bloqueados = m.bloqueados;

    this.tckAsignadosDev = m.tckAsignadosDev;
    this.tckActivosWIPDev = m.tckActivosWIPDev;
    this.tckDevueltosDev = m.tckDevueltosDev;
    this.tckBloqueadosDev = m.tckBloqueadosDev;
    this.kpiTasaRetrabajoDev = m.kpiTasaRetrabajoDev;
    this.kpiEficienciaSprintDev = m.kpiEficienciaSprintDev;
    this.kpiRatioBloqueosDev = m.kpiRatioBloqueosDev;

    this.tckPendientesQA = m.tckPendientesQA;
    this.kpiIndiceRechazoQA = m.kpiIndiceRechazoQA;
    this.kpiEficienciaCertificacion = m.kpiEficienciaCertificacion;
    this.tckCriticosBloqueantesQA = m.tckCriticosBloqueantesQA;
    this.tckFuncionalesMayoresQA = m.tckFuncionalesMayoresQA;
  }

  private inicializarConsolaGrafica(m: ChartMetrics): void {
    this.graficoTendenciaEntrada = factories.buildTendenciaEntrada(m);
    this.graficoAlertasCriticas = factories.buildAlertasCriticas(m);
    this.graficoEstabilidadFlujo = factories.buildEstabilidadFlujo(m);
    this.graficoDensidadAcumulacion = factories.buildDensidadAcumulacion(m);
    this.graficoRetrabajoDev = factories.buildRetrabajoDev(m);
    this.graficoVelocidadCertificacionQA = factories.buildVelocidadCertificacionQA(m);
    this.graficoDiagnosticoRadarQA = factories.buildDiagnosticoRadarQA(m);
    this.graficoEficienciaCompromiso = factories.buildEficienciaCompromiso(m, this.usuarioRol());
    this.graficoResolucionIngenieros = factories.buildResolucionIngenieros(m, this.usuarioNombre());
  }
}
