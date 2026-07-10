import { ParametroCatalogo } from '../interfaces/catalogo.model';

function catalogo(
  idParametro: number,
  codigo: string,
  nombre: string,
  orden: number,
  descripcion: string | null = null,
): ParametroCatalogo {
  return {
    idParametro,
    codigo,
    nombre,
    descripcion,
    activo: true,
    orden,
    valor: null,
    simulado: true,
  };
}

export const MOCK_TIPOS_CASO: ParametroCatalogo[] = [
  catalogo(1001, 'INCIDENTE', 'Incidente', 1),
  catalogo(1002, 'BUG', 'Bug', 2),
  catalogo(1003, 'REQUERIMIENTO', 'Requerimiento', 3),
  catalogo(1004, 'SOPORTE', 'Soporte', 4),
  catalogo(1005, 'VULNERABILIDAD', 'Vulnerabilidad', 5),
  catalogo(1006, 'MEJORA', 'Mejora', 6),
];

export const MOCK_PRIORIDADES: ParametroCatalogo[] = [
  catalogo(1101, 'CRITICA', 'Critica', 1),
  catalogo(1102, 'ALTA', 'Alta', 2),
  catalogo(1103, 'MEDIA', 'Media', 3),
  catalogo(1104, 'BAJA', 'Baja', 4),
];

export const MOCK_IMPACTOS: ParametroCatalogo[] = [
  catalogo(1201, 'BLOQUEA_OPERACION', 'Bloquea operacion', 1),
  catalogo(1202, 'AFECTA_PARCIALMENTE', 'Afecta parcialmente', 2),
  catalogo(1203, 'NO_BLOQUEA', 'No bloquea', 3),
  catalogo(1204, 'PREVENTIVO', 'Preventivo', 4),
];

export const MOCK_ESTADOS_HISTORIA_USUARIO: ParametroCatalogo[] = [
  catalogo(1301, 'SI', 'Si', 1),
  catalogo(1302, 'NO', 'No', 2),
  catalogo(1303, 'PENDIENTE', 'Pendiente', 3),
];

export const MOCK_AMBIENTES: ParametroCatalogo[] = [
  catalogo(1401, 'DESARROLLO', 'Desarrollo', 1),
  catalogo(1402, 'API_TESTING', 'API Testing', 2),
  catalogo(1403, 'QA', 'QA', 3),
  catalogo(1404, 'PRODUCCION', 'Produccion', 4),
  catalogo(1405, 'NO_IDENTIFICADO', 'No identificado', 5),
];

export const MOCK_SEVERIDADES: ParametroCatalogo[] = [
  catalogo(1501, 'CRITICA', 'Critica', 1),
  catalogo(1502, 'ALTA', 'Alta', 2),
  catalogo(1503, 'MEDIA', 'Media', 3),
  catalogo(1504, 'BAJA', 'Baja', 4),
];

export const MOCK_TIPOS_EVIDENCIA: ParametroCatalogo[] = [
  catalogo(1601, 'CAPTURA', 'Captura', 1),
  catalogo(1602, 'LOG', 'Log', 2),
  catalogo(1603, 'REQUEST_RESPONSE', 'Request / response', 3),
  catalogo(1604, 'URL', 'URL', 4),
  catalogo(1605, 'OTRO', 'Otro', 5),
];

export const MOCK_TIPOS_CAMBIO_TECNICO: ParametroCatalogo[] = [
  catalogo(1701, 'FRONTEND', 'Frontend', 1),
  catalogo(1702, 'BACKEND', 'Backend', 2),
  catalogo(1703, 'BASE_DATOS', 'Base de datos', 3),
  catalogo(1704, 'INTEGRACION', 'Integracion', 4),
  catalogo(1705, 'INFRAESTRUCTURA', 'Infraestructura', 5),
  catalogo(1706, 'DEVOPS', 'DevOps', 6),
  catalogo(1707, 'CONFIGURACION', 'Configuracion', 7),
];

export const MOCK_RIESGOS_CAMBIO: ParametroCatalogo[] = [
  catalogo(1801, 'CRITICO', 'Critico', 1),
  catalogo(1802, 'ALTO', 'Alto', 2),
  catalogo(1803, 'MEDIO', 'Medio', 3),
  catalogo(1804, 'BAJO', 'Bajo', 4),
];

export const MOCK_RESULTADOS_VALIDACION: ParametroCatalogo[] = [
  catalogo(1901, 'PENDIENTE', 'Pendiente', 1),
  catalogo(1902, 'EXITOSO', 'Exitoso', 2),
  catalogo(1903, 'FALLIDO', 'Fallido', 3),
  catalogo(1904, 'NO_APLICA', 'No aplica', 4),
];

export const MOCK_CATEGORIAS_CONOCIMIENTO: ParametroCatalogo[] = [
  catalogo(2001, 'ERROR_FUNCIONAL', 'Error funcional', 1),
  catalogo(2002, 'ERROR_TECNICO', 'Error tecnico', 2),
  catalogo(2003, 'INTEGRACION', 'Integracion', 3),
  catalogo(2004, 'DATOS', 'Datos', 4),
  catalogo(2005, 'CONFIGURACION', 'Configuracion', 5),
  catalogo(2006, 'SEGURIDAD', 'Seguridad', 6),
  catalogo(2007, 'DESPLIEGUE', 'Despliegue', 7),
  catalogo(2008, 'CONSULTA_OPERATIVA', 'Consulta operativa', 8),
];

export const MOCK_ESTADOS_ARTICULO_CONOCIMIENTO: ParametroCatalogo[] = [
  catalogo(2101, 'NO_APLICA', 'No aplica', 1),
  catalogo(2102, 'CANDIDATO', 'Candidato', 2),
  catalogo(2103, 'DOCUMENTADO', 'Documentado', 3),
];

export const MOCK_NIVELES_REUTILIZACION_CONOCIMIENTO: ParametroCatalogo[] = [
  catalogo(2201, 'ALTO', 'Alto', 1),
  catalogo(2202, 'MEDIO', 'Medio', 2),
  catalogo(2203, 'BAJO', 'Bajo', 3),
];
