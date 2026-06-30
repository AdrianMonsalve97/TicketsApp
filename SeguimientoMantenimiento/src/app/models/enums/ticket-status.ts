export enum TicketStatus {
  // ==========================================
  // FASE 1: Desarrollo (Rol: Desarrollador)
  // ==========================================
  EN_ANALISIS = 'EN ANALISIS',
  EN_PROCESO = 'EN PROCESO',
  ENTREGADO_A_LT = 'ENTREGADO A LT',

  // ==========================================
  // FASE 2: Ambiente de Desarrollo (Roles: LT y QA)
  // ==========================================
  DESPLIEGUE_A_DESARROLLO = 'DESPLIEGUE A DESARROLLO', // Puesto por LT
  EN_REVISION_DESARROLLO = 'EN REVISION DESARROLLO', // Puesto por QA
  APROBADO_PARA_QA = 'APROBADO PARA QA', // Puesto por QA

  // ==========================================
  // FASE 3: Ambiente de QA (Roles: LT y QA)
  // ==========================================
  DESPLIEGUE_A_QA = 'DESPLIEGUE A QA', // Puesto por LT
  EN_REVISION_QA = 'EN REVISION QA', // Puesto por QA
  PENDIENTE_CERTIFICACION = 'PENDIENTE CERTIFICACION', // Puesto por QA
  CERTIFICADO = 'CERTIFICADO', // Puesto por QA

  // ==========================================
  // FASE 4: Producción y Cierre (Rol: LT y Sistema)
  // ==========================================
  DESPLIEGUE_A_PRODUCCION = 'DESPLIEGUE A PRODUCCION', // Puesto por LT
  FINALIZADO = 'FINALIZADO', // Éxito global (Producción estable)

  // ==========================================
  // EXCEPCIONES Y PROBLEMAS (Varios Roles)
  // ==========================================
  BLOQUEO = 'BLOQUEO', // Usado por Dev o QA (Requiere justificación/Link Azure)
  DEVUELTO = 'DEVUELTO', // Usado por QA cuando falla en ambiente y vuelve a Dev
  ROLLBACK = 'ROLLBACK', // Usado si en Producción falla y toca reversar
}
