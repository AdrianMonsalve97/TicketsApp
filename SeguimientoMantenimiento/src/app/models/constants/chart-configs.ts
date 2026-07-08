import { ChartMetrics } from '../../core/services/ticket-metrics';

const sparklineConfig = { enabled: true };

export function buildTendenciaEntrada(metrics: ChartMetrics) {
  return {
    series: [{ name: 'Tickets', data: [0, metrics.totalTickets] }],
    chart: { height: 50, type: 'area', sparkline: sparklineConfig },
    colors: ['#10b981'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
  };
}

export function buildAlertasCriticas(metrics: ChartMetrics) {
  return {
    series: [{ name: 'Alertas', data: [0, metrics.bloqueados] }],
    chart: { height: 50, type: 'area', sparkline: sparklineConfig },
    colors: ['#f43f5e'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.15, opacityTo: 0.0 } },
  };
}

export function buildEstabilidadFlujo(metrics: ChartMetrics) {
  return {
    series: [
      { name: 'Desarrollo', data: [metrics.enDesarrollo] },
      { name: 'QA', data: [metrics.enQA] },
      { name: 'Entregados', data: [metrics.certificados] },
      { name: 'Impedimentos', data: [metrics.bloqueados] },
    ],
    chart: {
      height: 340,
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      foreColor: '#64748b',
    },
    colors: ['#6366f1', '#a855f7', '#10b981', '#f43f5e'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '42%',
        borderRadius: 6,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
    },
    stroke: { width: 0 },
    fill: { opacity: 0.9 },
    xaxis: { categories: ['Backlog actual'] },
    yaxis: { forceNiceScale: true },
    grid: { borderColor: 'rgba(255, 255, 255, 0.012)', strokeDashArray: 5 },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '10px',
      fontFamily: 'monospace',
    },
  };
}

export function buildDensidadAcumulacion(metrics: ChartMetrics) {
  return {
    series: [
      {
        name: 'Carga real',
        data: [metrics.enDesarrollo, metrics.enQA, metrics.bloqueados, metrics.certificados],
      },
    ],
    chart: {
      type: 'bar',
      height: 340,
      toolbar: { show: false },
      foreColor: '#94a3b8',
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
    },
    colors: ['#6366f1'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 4,
        dataLabels: { position: 'end' },
      },
    },
    fill: { type: 'solid', opacity: 0.9 },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff'],
        fontSize: '10px',
        fontFamily: 'monospace',
      },
      formatter: (val: number) => `${val} Tck`,
      offsetX: 0,
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.03)',
      xaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: [
        'DEV (En desarrollo)',
        'QA (En certificacion)',
        'BLOCK (Impedimentos)',
        'PROD (Entregados)',
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
        formatter: (val: string) => {
          const num = Number(val);
          if (Number.isNaN(num)) return '0';
          if (num % 1 !== 0) return '';
          return String(num);
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
      },
    },
    tooltip: {
      theme: 'dark',
      style: { fontSize: '11px', fontFamily: 'monospace' },
      y: {
        formatter: (val: number) => `${val} requerimientos`,
      },
    },
    legend: { show: false },
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
      formatter: (val: number) => `${val} tck`,
    },
    xaxis: {
      categories: [
        'En progreso',
        'En revision',
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
    series: [{ name: 'Tickets', data: [metrics.enQA, metrics.certificados] }],
    chart: { height: 260, type: 'bar', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#a855f7'],
    plotOptions: {
      bar: {
        columnWidth: '42%',
        borderRadius: 6,
        dataLabels: { position: 'top' },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: { colors: ['#fff'] },
      formatter: (val: number) => `${val}`,
    },
    stroke: { width: 0 },
    fill: { opacity: 0.9 },
    xaxis: { categories: ['En QA', 'Certificados'] },
    grid: { borderColor: 'rgba(255, 255, 255, 0.012)' },
  };
}

export function buildDiagnosticoRadarQA(metrics: ChartMetrics) {
  return {
    series: [
      { name: 'Densidad', data: [metrics.tckPendientesQA, metrics.bloqueados, metrics.certificados] },
    ],
    chart: { height: 250, type: 'radar', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#00f2fe'],
    xaxis: { categories: ['Ejecucion', 'Rechazos', 'Exitos'] },
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
    series: [{ name: 'Rendimiento', data: [rendimiento] }],
    chart: { height: 130, type: 'bar', toolbar: { show: false }, foreColor: '#64748b' },
    colors: ['#00f2fe'],
    plotOptions: { bar: { horizontal: true, barHeight: '25%', borderRadius: 4 } },
    xaxis: { categories: [usuarioNombre] },
  };
}
