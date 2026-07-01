import { ChartMetrics } from '../../core/services/ticket-metrics';

const sparklineConfig = { enabled: true };

export function buildTendenciaEntrada(metrics: ChartMetrics) {
  return {
    series: [{ name: 'Tickets', data: [4, 6, 5, 8, 6, 7, metrics.totalTickets] }],
    chart: { height: 50, type: 'area', sparkline: sparklineConfig },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
  };
}

export function buildAlertasCriticas(metrics: ChartMetrics) {
  return {
    series: [{ name: 'Alertas', data: [2, 3, 1, 2, 0, 1, metrics.bloqueados] }],
    chart: { height: 50, type: 'area', sparkline: sparklineConfig },
    colors: ['#f43f5e'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
  };
}

export function buildEstabilidadFlujo(metrics: ChartMetrics) {
  const wip = Math.max(metrics.enDesarrollo, 0);
  const qa = Math.max(metrics.enQA, 0);
  const done = Math.max(metrics.certificados, 0);
  const blocked = Math.max(metrics.bloqueados, 0);
  return {
    series: [
      {
        name: 'WIP',
        data: [wip, wip, wip, wip],
      },
      {
        name: 'QA',
        data: [qa, qa, qa, qa],
      },
      {
        name: 'Done',
        data: [done, done, done, done],
      },
      {
        name: 'Blocked',
        data: [blocked, blocked, blocked, blocked],
      },
    ],
    chart: { height: 340, type: 'area', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#6366f1', '#a855f7', '#10b981', '#f43f5e'],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.16, opacityTo: 0.0 } },
    xaxis: { categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'] },
    grid: { borderColor: 'rgba(255, 255, 255, 0.012)', strokeDashArray: 5 },
  };
}

export function buildDensidadAcumulacion(metrics: ChartMetrics) {
  return {
    series: [
      {
        name: 'Línea Control (WIP Limit)',
        data: [5, 4, 1, 10]
      },
      {
        name: 'Carga Real (Tickets Activos)',
        data: [metrics.enDesarrollo, metrics.enQA, metrics.bloqueados, metrics.certificados]
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
          return num;
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
}

export function buildRetrabajoDev(metrics: ChartMetrics) {
  const c = metrics.misTicketsCount;
  return {
    series: [
      {
        name: 'Tickets',
        data: [c.cEnProgreso, c.cEnRevision, c.cEnQA, c.cReabiertos, c.cBloqueados, c.cFinalizados],
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
}

export function buildVelocidadCertificacionQA(metrics: ChartMetrics) {
  return {
    series: [
      { name: 'Entradas', data: [metrics.enQA + 1, metrics.enQA + 2, metrics.enQA] },
      {
        name: 'Salidas',
        data: [metrics.certificados - 1, metrics.certificados, metrics.certificados + 1],
      },
    ],
    chart: { height: 260, type: 'area', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#a855f7', '#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: ['Sem 1', 'Sem 2', 'Sem 3'] },
  };
}

export function buildDiagnosticoRadarQA(metrics: ChartMetrics) {
  return {
    series: [
      { name: 'Densidad', data: [metrics.tckPendientesQA, metrics.bloqueados, metrics.certificados] },
    ],
    chart: { height: 250, type: 'radar', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#00f2fe'],
    xaxis: { categories: ['Ejecución', 'Rechazos', 'Éxitos'] },
    plotOptions: { radar: { size: 70, polygons: { fill: { colors: ['transparent'] } } } },
  };
}

export function buildEficienciaCompromiso(metrics: ChartMetrics, usuarioRol: string) {
  return {
    series: [
      usuarioRol === 'DEV' ? metrics.kpiEficienciaSprintDev : metrics.kpiEficienciaCertificacion,
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
}

export function buildResolucionIngenieros(metrics: ChartMetrics, usuarioNombre: string) {
  const rendimiento = Math.max(
    0,
    Math.min(100, Math.round(metrics.kpiEficienciaSprintDev || metrics.kpiEficienciaCertificacion || 0)),
  );
  return {
    series: [
      {
        name: 'Rendimiento',
        data: [rendimiento],
      },
    ],
    chart: { height: 130, type: 'bar', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#00f2fe'],
    plotOptions: { bar: { horizontal: true, barHeight: '25%', borderRadius: 4 } },
    xaxis: { categories: [usuarioNombre] },
  };
}
