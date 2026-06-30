import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TicketStatus } from '../../../models/enums/ticket-status';

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './analytics-charts.html',
  styleUrl: './analytics-charts.css',
})
export class AnalyticsChartsComponent implements OnChanges {
  @Input() ticketsDataSource: any[] = [];
  @Input() usuarioRol: 'PMO_LT' | 'DEV' | 'QA' = 'PMO_LT';
  @Input() usuarioFirmaId: string = 'DEV-Hamilton';
  public graficoTendenciaEntrada: any;
  public graficoAlertasCriticas: any;
  public graficoEstabilidadFlujo: any;
  public graficoDensidadAcumulacion: any;
  public graficoEficienciaCompromiso: any;
  public graficoResolucionIngenieros: any;
  public graficoRetrabajoDev: any;
  public graficoVelocidadCertificacionQA: any;
  public graficoDiagnosticoRadarQA: any;
  public totalTickets = 0;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ticketsDataSource) {
      this.procesarMetricasPorEstados();
      this.inicializarConsolaGrafica();
    }
  }

  public alternarTooltip(id: string, event: Event): void {
    event.stopPropagation();
    this.tooltipActivo[id] = !this.tooltipActivo[id];
    Object.keys(this.tooltipActivo).forEach((key) => {
      if (key !== id) this.tooltipActivo[key] = false;
    });
  }

  private procesarMetricasPorEstados(): void {
    const data = this.ticketsDataSource;
    this.totalTickets = data.length;

    this.enDesarrollo = data.filter((t) =>
      [
        TicketStatus.EN_ANALISIS,
        TicketStatus.EN_PROCESO,
        TicketStatus.EN_REVISION_DESARROLLO,
      ].includes(t.estadoActual),
    ).length;

    this.enQA = data.filter((t) =>
      [
        TicketStatus.APROBADO_PARA_QA,
        TicketStatus.DESPLIEGUE_A_QA,
        TicketStatus.EN_REVISION_QA,
        TicketStatus.PENDIENTE_CERTIFICACION,
      ].includes(t.estadoActual),
    ).length;

    this.certificados = data.filter((t) =>
      [
        TicketStatus.CERTIFICADO,
        TicketStatus.FINALIZADO,
        TicketStatus.DESPLIEGUE_A_PRODUCCION,
      ].includes(t.estadoActual),
    ).length;

    this.bloqueados = data.filter((t) =>
      [TicketStatus.BLOQUEO, TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual),
    ).length;

    const misTickets = data.filter((t) => t.desarrolladorAsignadoId === this.usuarioFirmaId);
    this.tckAsignadosDev = misTickets.length;
    this.tckActivosWIPDev = misTickets.filter((t) =>
      [TicketStatus.EN_ANALISIS, TicketStatus.EN_PROCESO].includes(t.estadoActual),
    ).length;
    this.tckDevueltosDev = misTickets.filter((t) =>
      [TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual),
    ).length;
    this.tckBloqueadosDev = misTickets.filter(
      (t) => t.estadoActual === TicketStatus.BLOQUEO,
    ).length;

    const misFinalizados = misTickets.filter((t) =>
      [
        TicketStatus.CERTIFICADO,
        TicketStatus.FINALIZADO,
        TicketStatus.DESPLIEGUE_A_PRODUCCION,
      ].includes(t.estadoActual),
    ).length;

    this.kpiTasaRetrabajoDev =
      misTickets.length > 0 ? Math.round((this.tckDevueltosDev / misTickets.length) * 100) : 0;
    this.kpiEficienciaSprintDev =
      this.tckAsignadosDev > 0 ? Math.round((misFinalizados / this.tckAsignadosDev) * 100) : 0;
    this.kpiRatioBloqueosDev =
      this.tckAsignadosDev > 0
        ? Math.round((this.tckBloqueadosDev / this.tckAsignadosDev) * 100)
        : 0;

    this.tckPendientesQA = data.filter((t) =>
      [TicketStatus.APROBADO_PARA_QA, TicketStatus.DESPLIEGUE_A_QA].includes(t.estadoActual),
    ).length;
    const poolQA = this.tckPendientesQA + this.certificados;
    this.kpiEficienciaCertificacion =
      poolQA > 0 ? Math.round((this.certificados / poolQA) * 100) : 0;
    this.kpiIndiceRechazoQA = poolQA > 0 ? Math.round((this.bloqueados / poolQA) * 100) : 0;
    this.tckCriticosBloqueantesQA = data.filter(
      (t) => t.estadoActual === TicketStatus.BLOQUEO,
    ).length;
    this.tckFuncionalesMayoresQA = data.filter(
      (t) => t.estadoActual === TicketStatus.DEVUELTO,
    ).length;
  }

  private inicializarConsolaGrafica(): void {
    const sparklineConfig = { enabled: true };

    this.graficoTendenciaEntrada = {
      series: [{ name: 'Tickets', data: [4, 6, 5, 8, 6, 7, this.totalTickets] }],
      chart: { height: 50, type: 'area', sparkline: sparklineConfig },
      colors: ['#10b981'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
    };

    this.graficoAlertasCriticas = {
      series: [{ name: 'Alertas', data: [2, 3, 1, 2, 0, 1, this.bloqueados] }],
      chart: { height: 50, type: 'area', sparkline: sparklineConfig },
      colors: ['#f43f5e'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
    };

    this.graficoEstabilidadFlujo = {
      series: [
        {
          name: 'WIP',
          data: [
            this.enDesarrollo + 2,
            this.enDesarrollo + 1,
            this.enDesarrollo + 3,
            this.enDesarrollo,
          ],
        },
        {
          name: 'Throughput',
          data: [
            this.certificados - 2,
            this.certificados - 1,
            this.certificados,
            this.certificados,
          ],
        },
      ],
      chart: { height: 340, type: 'area', toolbar: { show: false }, foreColor: '#64748b' },
      colors: ['#6366f1', '#00f2fe'],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.16, opacityTo: 0.0 } },
      xaxis: { categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'] },
      grid: { borderColor: 'rgba(255, 255, 255, 0.012)', strokeDashArray: 5 },
    };
    // 2. Volumen por Fase (PMO/LT)
    this.graficoDensidadAcumulacion = {
      series: [
        {
          name: 'Línea Control (WIP Limit)',
          data: [5, 4, 1, 10]
        },
        {
          name: 'Carga Real (Tickets Activos)',
          data: [this.enDesarrollo, this.enQA, this.bloqueados, this.certificados]
        }
      ],
      chart: {
        type: 'bar',
        height: 340,
        toolbar: { show: false },
        foreColor: '#94a3b8',
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
      },
      colors: ['rgba(255, 255, 255, 0.08)', '#6366f1'],

      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '55%',
          borderRadius: 4,
          distributed: false,
          dataLabels: {
            position: 'end'
          }
        }
      },

      fill: {
        type: 'solid',
        opacity: 0.9,
        colors: [
          'rgba(255, 255, 255, 0.08)',
          function({ value, seriesIndex, dataPointIndex }: any) {
            if (seriesIndex === 1) {
              const colorsCyberpunk = [
                '#a9c7ff',
                '#99f6e4',
                '#ff6b8b',
                '#a7f3d0'
              ];
              return colorsCyberpunk[dataPointIndex] || '#6366f1';
            }
            return 'rgba(255, 255, 255, 0.08)';
          }
        ]
      },

      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
          colors: ['#fff'],
          fontSize: '10px',
          fontFamily: 'monospace',
        },
        formatter: function (val: number, opt: any) {
          if (opt.seriesIndex === 1) return val + ' Tck';
          return '';
        },
        offsetX: 0,
      },

      grid: {
        borderColor: 'rgba(255, 255, 255, 0.03)',
        xaxis: { lines: { show: true } },
      },

      xaxis: {
        categories: [
          'DEV (En Desarrollo)',
          'QA (En Certificación)',
          'BLOCK (Impedimentos)',
          'PROD (Entregados)'
        ],
        title: {
          text: 'VOLUMEN DE REQUERIMIENTOS ASIGNADOS',
          style: {
            color: '#64748b',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'monospace',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        forceNiceScale: true,
        labels: {
          formatter: function (val: string) {
            const num = Number(val);
            if (num % 1 !== 0) return '';
            if (isNaN(num)) return '0 u';
            return num ;
          },
        },
      },

      yaxis: {
        title: {
          text: 'ESTADOS DEL FLUJO ALM',
          style: {
            color: '#64748b',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'monospace',
          },
        }
      },

      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        style: { fontSize: '11px', fontFamily: 'monospace' },
        y: {
          formatter: function (val: number) {
            return val + ' Requerimientos';
          },
        },
      },

      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '10px',
        fontFamily: 'monospace',
        markers: { radius: 12 },
      }
    };

    const misTickets = this.ticketsDataSource.filter(
      (t) => t.desarrolladorAsignadoId === this.usuarioFirmaId,
    );

    const cEnProgreso = misTickets.filter((t) =>
      [TicketStatus.EN_ANALISIS, TicketStatus.EN_PROCESO].includes(t.estadoActual),
    ).length;
    const cEnRevision = misTickets.filter(
      (t) => t.estadoActual === TicketStatus.EN_REVISION_DESARROLLO,
    ).length;
    const cEnQA = misTickets.filter((t) =>
      [
        TicketStatus.APROBADO_PARA_QA,
        TicketStatus.DESPLIEGUE_A_QA,
        TicketStatus.EN_REVISION_QA,
      ].includes(t.estadoActual),
    ).length;
    const cReabiertos = misTickets.filter((t) =>
      [TicketStatus.DEVUELTO, TicketStatus.ROLLBACK].includes(t.estadoActual),
    ).length;
    const cBloqueados = misTickets.filter((t) => t.estadoActual === TicketStatus.BLOQUEO).length;
    const cFinalizados = misTickets.filter((t) =>
      [
        TicketStatus.CERTIFICADO,
        TicketStatus.FINALIZADO,
        TicketStatus.DESPLIEGUE_A_PRODUCCION,
      ].includes(t.estadoActual),
    ).length;

    this.graficoRetrabajoDev = {
      series: [
        {
          name: 'Tickets',
          data: [cEnProgreso, cEnRevision, cEnQA, cReabiertos, cBloqueados, cFinalizados],
        },
      ],
      chart: { type: 'bar', height: 340, toolbar: { show: false }, foreColor: '#94a3b8' },
      colors: ['#38bdf8', '#6366f1', '#a855f7', '#f43f5e', '#eab308', '#10b981'],
      plotOptions: {
        bar: {
          columnWidth: '45%',
          distributed: true,
          borderRadius: 6,
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { colors: ['#fff'] },
        formatter: (v: any) => v + ' tck',
      },
      xaxis: {
        categories: [
          'En Progreso',
          'En Revisión',
          'En QA',
          'Reabiertos',
          'Bloqueados',
          'Finalizados',
        ],
        labels: { style: { fontSize: '10px', fontWeight: 'bold' } },
      },
      grid: { borderColor: 'rgba(255, 255, 255, 0.012)' },
      legend: { show: false },
    };

    this.graficoVelocidadCertificacionQA = {
      series: [
        { name: 'Entradas', data: [this.enQA + 1, this.enQA + 2, this.enQA] },
        {
          name: 'Salidas',
          data: [this.certificados - 1, this.certificados, this.certificados + 1],
        },
      ],
      chart: { height: 260, type: 'area', toolbar: { show: false }, foreColor: '#64748b' },
      colors: ['#a855f7', '#10b981'],
      stroke: { curve: 'smooth', width: 2 },
      xaxis: { categories: ['Sem 1', 'Sem 2', 'Sem 3'] },
    };

    this.graficoDiagnosticoRadarQA = {
      series: [
        { name: 'Densidad', data: [this.tckPendientesQA, this.bloqueados, this.certificados] },
      ],
      chart: { height: 250, type: 'radar', toolbar: { show: false }, foreColor: '#64748b' },
      colors: ['#00f2fe'],
      xaxis: { categories: ['Ejecución', 'Rechazos', 'Éxitos'] },
      plotOptions: { radar: { size: 70, polygons: { fill: { colors: ['transparent'] } } } },
    };

    this.graficoEficienciaCompromiso = {
      series: [
        this.usuarioRol === 'DEV' ? this.kpiEficienciaSprintDev : this.kpiEficienciaCertificacion,
      ],
      chart: { height: 170, type: 'radialBar' },
      colors: ['#10b981'],
      plotOptions: {
        radialBar: {
          hollow: { size: '70%' },
          dataLabels: {
            name: { offsetY: -5, fontSize: '10px' },
            value: { offsetY: 5, fontSize: '20px', color: '#fff' },
          },
        },
      },
    };

    this.graficoResolucionIngenieros = {
      series: [{ name: 'ANS', data: [94, 88, 91] }],
      chart: { height: 130, type: 'bar', toolbar: { show: false }, foreColor: '#64748b' },
      colors: ['#00f2fe'],
      plotOptions: { bar: { horizontal: true, barHeight: '25%', borderRadius: 4 } },
      xaxis: { categories: ['Hamilton', 'Brayan', 'Miguel'] },
    };
  }
}
