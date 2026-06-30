import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ticket } from '../../models/interfaces/ticket.model';
import { TicketStatus } from '../../models/enums/ticket-status';

@Injectable({
  providedIn: 'root',
})
export class TicketMockService {
  private tickets: Ticket[] = [
    {
      idTicket: 'TCK-1001',
      codigoCaso: 'CASE-2026-001',
      historiaUsuario: 'HU-2133',
      titulo: 'Error en liquidación de apoyos',
      descripcion:
        'El sistema no está calculando correctamente la liquidación cuando el municipio no permite cobro.',
      estadoActual: TicketStatus.EN_PROCESO,
      idUsuarioAsignado: 101,
      desarrolladorAsignadoId: 'DEV-Hamilton',
      fechaAsignacion: new Date('2026-06-15T10:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-20T14:30:00'),
      carpetaMedios: '/medios/tickets/tck1001',
      causaRaiz: 'Condicional de cobro invertido en la consulta de excepciones por municipio.',
      solucionPropuesta:
        'Ajustar la cláusula condicional en el SP de cálculo y actualizar entidades en la API.',
      repositoriosAfectados: [
        {
          idRepositorio: 'R1',
          repositorio: 'DOTNET_Servicios_Liquidacion',
          link: '',
          descripcion: 'API',
        },
        {
          idRepositorio: 'R2',
          repositorio: 'ANGULAR_LIQUIDACION',
          link: '',
          descripcion: 'Frontend',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1002',
      codigoCaso: 'CASE-2026-002',
      titulo: 'Fallo al autenticar en Android',
      descripcion:
        'El endpoint Seguridad/AuthenticaUsuarioApp no se encuentra en el código de Android ControlleAPP.',
      estadoActual: TicketStatus.BLOQUEO,
      historiaUsuario: 'HU-8475',
      idUsuarioAsignado: 102,
      desarrolladorAsignadoId: 'DEV-Brayan',
      qaAsignadoId: 'QA-Laura',
      fechaAsignacion: new Date('2026-06-18T09:15:00'),
      fechaUltimaActualizacion: new Date('2026-06-21T16:00:00'),
      carpetaMedios: '/medios/tickets/tck1002',
      repositoriosAfectados: [
        {
          idRepositorio: 'R3',
          repositorio: 'Android_ControlleAPP',
          link: '',
          descripcion: 'Mobile',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1003',
      codigoCaso: 'CASE-2026-003',
      titulo: 'Optimización GeoMultiZona',
      descripcion:
        'Mejorar el tiempo de respuesta de la consulta masiva de zonas en ambientes de contingencia.',
      estadoActual: TicketStatus.CERTIFICADO,
      idUsuarioAsignado: 103,
      desarrolladorAsignadoId: 'DEV-Miguel',
      qaAsignadoId: 'QA-Santiago',
      ltAsignadoId: 'LT-Edward',
      fechaAsignacion: new Date('2026-06-01T08:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T11:00:00'),
      causaRaiz: 'Falta de indexación en la llave compuesta de zonas geográficas masivas.',
      solucionPropuesta: 'Aplicar el script de migración v2.1 para indexación en caliente.',
      repositoriosAfectados: [
        { idRepositorio: 'R4', repositorio: 'ServicioIntegraciones', link: '', descripcion: 'API' },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1004',
      codigoCaso: 'CASE-2026-004',
      titulo: 'Refactorización del Core de Sesiones',
      descripcion:
        'Análisis de vulnerabilidad OWASP sobre tokens de sesión concurrentes expuestos en cookies.',
      estadoActual: TicketStatus.EN_ANALISIS,
      idUsuarioAsignado: 101,
      desarrolladorAsignadoId: 'DEV-Hamilton',
      fechaAsignacion: new Date('2026-06-19T11:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-19T15:00:00'),
      repositoriosAfectados: [
        { idRepositorio: 'R5', repositorio: 'AUTH_Microservice', link: '', descripcion: 'API' },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1005',
      codigoCaso: 'CASE-2026-005',
      titulo: 'Despliegue Gateway a Staging',
      descripcion:
        'Paso de los artefactos compilados del API Gateway hacia el clúster local de desarrollo.',
      estadoActual: TicketStatus.DESPLIEGUE_A_DESARROLLO,
      idUsuarioAsignado: 102,
      desarrolladorAsignadoId: 'DEV-Brayan',
      fechaAsignacion: new Date('2026-06-20T08:30:00'),
      fechaUltimaActualizacion: new Date('2026-06-20T10:00:00'),
      repositoriosAfectados: [
        {
          idRepositorio: 'R6',
          repositorio: 'KONG_Gateway_Config',
          link: '',
          descripcion: 'DevOps',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1006',
      codigoCaso: 'CASE-2026-006',
      titulo: 'Revisión técnica de Pull Request #412',
      descripcion:
        'Validación por parte del Líder Técnico sobre la implementación de concurrencia en colas de mensajería.',
      estadoActual: TicketStatus.EN_REVISION_DESARROLLO,
      idUsuarioAsignado: 103,
      desarrolladorAsignadoId: 'DEV-Miguel',
      ltAsignadoId: 'LT-Edward',
      fechaAsignacion: new Date('2026-06-14T16:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-21T09:00:00'),
      repositoriosAfectados: [
        {
          idRepositorio: 'R1',
          repositorio: 'DOTNET_Servicios_Liquidacion',
          link: '',
          descripcion: 'API',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1007',
      codigoCaso: 'CASE-2026-007',
      titulo: 'Smoke Tests para Suite de Pagos',
      descripcion:
        'Pruebas de humo aprobadas y listas para la asignación formal de batería de QA de regresión.',
      estadoActual: TicketStatus.APROBADO_PARA_QA,
      idUsuarioAsignado: 101,
      desarrolladorAsignadoId: 'DEV-Hamilton',
      qaAsignadoId: 'QA-Laura',
      fechaAsignacion: new Date('2026-06-10T07:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-21T18:20:00'),
      repositoriosAfectados: [
        {
          idRepositorio: 'R7',
          repositorio: 'STRIPE_Integration_Core',
          link: '',
          descripcion: 'API',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1008',
      codigoCaso: 'CASE-2026-008',
      titulo: 'Ejecución Pruebas Funcionales Web',
      descripcion:
        'Validación de flujos alternos y testing manual sobre los componentes de interfaz en el ambiente de QA.',
      estadoActual: TicketStatus.EN_REVISION_QA,
      idUsuarioAsignado: 102,
      desarrolladorAsignadoId: 'DEV-Brayan',
      qaAsignadoId: 'QA-Santiago',
      fechaAsignacion: new Date('2026-06-12T14:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T10:30:00'),
      repositoriosAfectados: [
        {
          idRepositorio: 'R2',
          repositorio: 'ANGULAR_LIQUIDACION',
          link: '',
          descripcion: 'Frontend',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1009',
      codigoCaso: 'CASE-2026-009',
      titulo: 'Cierre de No Conformidades de Seguridad',
      descripcion:
        'Esperando el acta de certificación de código estático SonarQube por parte del comité de calidad.',
      estadoActual: TicketStatus.PENDIENTE_CERTIFICACION,
      idUsuarioAsignado: 103,
      desarrolladorAsignadoId: 'DEV-Miguel',
      qaAsignadoId: 'QA-Laura',
      fechaAsignacion: new Date('2026-06-05T09:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T12:00:00'),
      repositoriosAfectados: [
        { idRepositorio: 'R4', repositorio: 'ServicioIntegraciones', link: '', descripcion: 'API' },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1010',
      codigoCaso: 'CASE-2026-010',
      titulo: 'Paso a Producción Sprint 4',
      descripcion:
        'Despliegue automatizado mediante pipelines de Azure DevOps hacia los servidores productivos.',
      estadoActual: TicketStatus.DESPLIEGUE_A_PRODUCCION,
      idUsuarioAsignado: 101,
      desarrolladorAsignadoId: 'DEV-Hamilton',
      ltAsignadoId: 'LT-Edward',
      fechaAsignacion: new Date('2026-06-02T06:30:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T15:00:00'),
      repositoriosAfectados: [
        {
          idRepositorio: 'R1',
          repositorio: 'DOTNET_Servicios_Liquidacion',
          link: '',
          descripcion: 'API',
        },
        {
          idRepositorio: 'R2',
          repositorio: 'ANGULAR_LIQUIDACION',
          link: '',
          descripcion: 'Frontend',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1011',
      codigoCaso: 'CASE-2026-011',
      titulo: 'Inconsistencia en Cierre de Caja',
      descripcion:
        'El reporte nocturno arroja diferencias de centavos. Se sospecha de un reajuste de zona horaria.',
      estadoActual: TicketStatus.DEVUELTO,
      idUsuarioAsignado: 102,
      desarrolladorAsignadoId: 'DEV-Brayan',
      qaAsignadoId: 'QA-Santiago',
      fechaAsignacion: new Date('2026-06-16T17:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T16:15:00'),
      causaRaiz: 'Truncado de decimales en lugar de redondeo bancario en el microservicio de caja.',
      repositoriosAfectados: [
        {
          idRepositorio: 'R7',
          repositorio: 'STRIPE_Integration_Core',
          link: '',
          descripcion: 'API',
        },
      ],
      historial: [],
    },
    {
      idTicket: 'TCK-1012',
      codigoCaso: 'CASE-2026-012',
      titulo: 'Migración masiva de Base de Datos v2.1',
      descripcion:
        'Fallo catastrófico en script de indexación. Se ejecuta plan de contingencia inmediato.',
      estadoActual: TicketStatus.ROLLBACK,
      idUsuarioAsignado: 103,
      desarrolladorAsignadoId: 'DEV-Miguel',
      ltAsignadoId: 'LT-Edward',
      fechaAsignacion: new Date('2026-06-21T22:00:00'),
      fechaUltimaActualizacion: new Date('2026-06-22T02:00:00'),
      carpetaMedios: '/medios/tickets/tck1012_panic',
      causaRaiz: 'Deadlock generado por bloqueo exclusivo de tablas transaccionales en horas pico.',
      solucionPropuesta:
        'Particionar el script de indexación para ejecución por lotes en ventanas de mantenimiento.',
      repositoriosAfectados: [
        { idRepositorio: 'R4', repositorio: 'ServicioIntegraciones', link: '', descripcion: 'API' },
      ],
      historial: [],
    },
  ];

  getTickets(): Observable<Ticket[]> {
    return of(this.tickets);
  }
}
