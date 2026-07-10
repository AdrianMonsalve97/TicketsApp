# Contrato propuesto para steppers de ticket

Este documento deja una propuesta de modelos para separar dos momentos distintos del flujo:

- **Creacion de ticket:** solo registra el caso recibido y la informacion inicial disponible.
- **Actualizacion de ticket:** completa diagnostico, contexto tecnico, solucion, validacion y conocimiento.

La idea es que los catalogos de negocio lleguen desde backend despues del login y vivan en memoria durante la sesion. Los `enum` quedan reservados para comportamiento interno del frontend.

## Principios

- El stepper de creacion no debe pedir causa raiz, solucion, validacion, repositorios ni datos de despliegue.
- El usuario ve nombres, pero los requests deben enviar IDs cuando el backend los necesita.
- Los campos de diagnostico y conocimiento se diligencian durante la actualizacion del ticket.
- Los modelos de API y los modelos de vista deben mantenerse separados para no contaminar servicios ni componentes.
- Los parametros de negocio no deben ser `enum` de TypeScript si vienen de base de datos.
- Los enums deben representar estados internos de UI o decisiones que pertenecen al frontend.
- El stepper de actualizacion no debe ser lineal ni bloqueante: cada paso se puede guardar de forma independiente.
- Guardar desde un paso de actualizacion debe enviar solo la informacion modificada de esa seccion.
- Los catalogos se cargan despues del login, se guardan solo en memoria y se limpian en logout.
- No se deben persistir catalogos en cookies, `localStorage`, `sessionStorage` ni IndexedDB en esta etapa.

## Enums internos del frontend

```ts
export enum ModoAsignacionTicket {
  Autoasignacion = 'AUTOASIGNACION',
  SeleccionPlanner = 'SELECCION_PLANNER',
}

export enum CatalogoSyncStatus {
  Idle = 'IDLE',
  Sincronizando = 'SINCRONIZANDO',
  Sincronizado = 'SINCRONIZADO',
  Error = 'ERROR',
}
```

Estos valores no vienen de base de datos; son reglas de comportamiento del frontend.

## Types compartidos

```ts
export type IdUsuario = number;
export type CodigoCaso = string;
export type IdParametroCatalogo = number;
export type CodigoParametroCatalogo = string;
export type Nullable<T> = T | null;

export type TicketStepperMode = 'create' | 'update';

export interface StepperStepDefinition<TStepId extends string> {
  id: TStepId;
  titulo: string;
  descripcion?: string;
  requerido: boolean;
}

export interface UsuarioAsignableOption {
  idUsuario: IdUsuario;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
}
```

## Catalogos dinamicos en memoria

Los campos que negocio puede modificar desde base de datos deben llegar desde backend como parametros. El frontend no debe conocer de antemano los valores concretos de prioridad, tipo de caso, ambiente, severidad, riesgo, etc.

### Parametro base

```ts
export interface ParametroCatalogo {
  idParametro: IdParametroCatalogo;
  codigo: CodigoParametroCatalogo;
  nombre: string;
  descripcion?: Nullable<string>;
  activo: boolean;
  orden?: Nullable<number>;

  /**
   * Valor opcional para compatibilidad con endpoints existentes.
   * Ejemplo: origenTicket hoy podria necesitar 1 o 2.
   */
  valor?: Nullable<string | number | boolean>;
}
```

### Catalogos usados por tickets

```ts
export interface TicketCatalogos {
  origenesTicket: ParametroCatalogo[];
  tiposCaso: ParametroCatalogo[];
  prioridades: ParametroCatalogo[];
  impactos: ParametroCatalogo[];
  estadosHistoriaUsuario: ParametroCatalogo[];
  ambientes: ParametroCatalogo[];
  severidades: ParametroCatalogo[];
  tiposEvidencia: ParametroCatalogo[];
  tiposCambioTecnico: ParametroCatalogo[];
  riesgosCambio: ParametroCatalogo[];
  resultadosValidacion: ParametroCatalogo[];
  categoriasConocimiento: ParametroCatalogo[];
  estadosArticuloConocimiento: ParametroCatalogo[];
  nivelesReutilizacionConocimiento: ParametroCatalogo[];
}

export type TicketCatalogoKey = keyof TicketCatalogos;
```

### Respuesta del backend

```ts
export interface TicketCatalogosResponse {
  version: string;
  fechaActualizacion: string;
  catalogos: TicketCatalogos;
}
```

### Store en memoria

Este store no debe persistir datos en navegador. Su vida util es la sesion activa de la app.

```ts
export interface CatalogoStoreState {
  status: CatalogoSyncStatus;
  cargado: boolean;
  cargando: boolean;
  version?: Nullable<string>;
  fechaCarga?: Nullable<string>;
  catalogos?: Nullable<TicketCatalogos>;
  error?: Nullable<string>;
}

export interface CatalogoStoreReader {
  getCatalogo(key: TicketCatalogoKey): ParametroCatalogo[];
  findById(key: TicketCatalogoKey, idParametro: IdParametroCatalogo): Nullable<ParametroCatalogo>;
  findByCodigo(key: TicketCatalogoKey, codigo: CodigoParametroCatalogo): Nullable<ParametroCatalogo>;
}

export interface CatalogoStoreWriter {
  hydrate(response: TicketCatalogosResponse): void;
  clear(): void;
}
```

### Uso en selects

```ts
export interface CatalogoSelectOption {
  value: IdParametroCatalogo;
  label: string;
  codigo: CodigoParametroCatalogo;
  disabled?: boolean;
}

export type CatalogoSelectOptionsMapper = (
  parametros: ParametroCatalogo[],
) => CatalogoSelectOption[];
```

Regla de UI:

- `value` siempre debe ser `idParametro`.
- `label` siempre debe ser `nombre`.
- `codigo` sirve para reglas puntuales del frontend, no para mostrarlo como texto principal.
- Los formularios guardan IDs; las tablas y detalles resuelven nombres desde el catalogo.

### Flujo de carga y limpieza

```txt
Login correcto
  -> AuthService guarda la sesion como ya corresponda
  -> ToastService muestra "Sincronizando parametros..."
  -> CatalogoService consulta GET /api/parametros/catalogos-ticket
  -> CatalogoStoreService guarda los catalogos en memoria
  -> ToastService cierra el toast de sincronizacion
  -> La app navega al dashboard

Refresh del navegador
  -> La memoria se pierde
  -> Si la sesion sigue siendo valida, se vuelven a pedir los catalogos

Logout
  -> AuthService cierra sesion
  -> CatalogoStoreService.clear()
  -> La app redirige a /login
```

### UX de sincronizacion

La sincronizacion de catalogos no debe mostrarse como modal, popup ni overlay. Debe ser un toast persistente y no invasivo.

```ts
export interface CatalogoSyncToastState {
  toastId?: Nullable<string>;
  status: CatalogoSyncStatus;
  mensaje: string;
  puedeCerrar: boolean;
  puedeReintentar: boolean;
}
```

Comportamiento esperado:

- Al iniciar la carga: mostrar toast persistente con `Sincronizando parametros...`.
- Mientras carga: mantener el toast visible sin bloquear la navegacion general.
- Al finalizar correctamente: cerrar el toast automaticamente.
- Si falla: cambiar el toast a error con accion `Reintentar`.
- Si el usuario cierra sesion: cerrar el toast y limpiar `CatalogoStoreService`.
- No mostrar modal ni bloquear toda la pantalla.

Textos sugeridos:

```txt
Sincronizando parametros...
Preparando catalogos de la aplicacion.

No pudimos sincronizar los parametros.
Reintenta la sincronizacion o cierra sesion.
```

Regla de seguridad funcional:

- El dashboard puede cargar, pero los formularios que dependan de catalogos deben deshabilitar sus selects hasta que `CatalogoSyncStatus` sea `Sincronizado`.
- Si un formulario se abre antes de terminar la sincronizacion, debe mostrar selects en estado de carga.
- No usar valores quemados como fallback.

### Estrategia temporal mientras backend termina catalogos

Mientras el backend no tenga listo `GET /api/parametros/catalogos-ticket`, el frontend puede sincronizar catalogos con una estrategia mixta:

```txt
Datos reales desde backend:
  GET /api/parametros/roles
  GET /api/parametros/estados-ticket
  GET /api/parametros/origenes-ticket
  GET /api/parametros/areas-ticket

Datos simulados en frontend:
  tiposCaso
  prioridades
  impactos
  estadosHistoriaUsuario
  ambientes
  severidades
  tiposEvidencia
  tiposCambioTecnico
  riesgosCambio
  resultadosValidacion
  categoriasConocimiento
  estadosArticuloConocimiento
  nivelesReutilizacionConocimiento
```

Regla para el mock:

- Debe vivir en un archivo centralizado de constantes.
- Debe marcar cada parametro como `simulado: true`.
- No debe estar duplicado dentro de componentes.
- Cuando el backend entregue el endpoint consolidado, se elimina el mock y se cambia solo el servicio de sincronizacion.

### Seguridad

- No guardar tokens en el store de catalogos.
- No guardar contrasenas.
- No guardar tickets completos.
- No guardar informacion personal sensible.
- No guardar catalogos en cookies porque viajan en cada request.
- No guardar catalogos en IndexedDB por ahora porque quedarian persistidos en el navegador.
- Los catalogos en memoria siguen siendo visibles durante la sesion desde DevTools, por eso no deben contener datos sensibles.

## Stepper de creacion

El objetivo es que crear un ticket sea liviano. Este flujo debe responder: que caso llego, cual es el problema y quien lo toma.

### Step ids

```ts
export type CrearTicketStepId =
  | 'caso'
  | 'clasificacion'
  | 'asignacion'
  | 'revision';
```

### Step 1: caso recibido

```ts
export interface CrearTicketCasoStep {
  codigoCaso: CodigoCaso;
  idOrigenTicket: IdParametroCatalogo;
  titulo: string;
  descripcion: string;
}
```

### Step 2: clasificacion inicial

```ts
export interface CrearTicketClasificacionStep {
  idTipoCaso: IdParametroCatalogo;
  idPrioridad: IdParametroCatalogo;
  idImpacto?: Nullable<IdParametroCatalogo>;
  idEstadoHistoriaUsuario: IdParametroCatalogo;
  historiaUsuario?: Nullable<string>;
  areaSolicitante?: Nullable<string>;
  procesoAfectado?: Nullable<string>;
  idAmbienteReportado?: Nullable<IdParametroCatalogo>;
}
```

### Step 3: asignacion

```ts
export interface CrearTicketAsignacionStep {
  modoAsignacion: ModoAsignacionTicket;
  idUsuarioAsignado: IdUsuario;
  usuarioAsignado?: Nullable<UsuarioAsignableOption>;
  comentarioInicial?: Nullable<string>;
}
```

### Estado del stepper de creacion

```ts
export interface CrearTicketStepperState {
  caso: CrearTicketCasoStep;
  clasificacion: CrearTicketClasificacionStep;
  asignacion: CrearTicketAsignacionStep;
}

export type CrearTicketStepperDefinition =
  StepperStepDefinition<CrearTicketStepId>[];
```

### Request actual compatible con backend

Este es el body que el backend soporta actualmente.

```ts
export interface CrearTicketRequestActualBackend {
  codigoCaso: string;
  origenTicket: number;
  titulo: string;
  descripcion: string;
  idUsuarioAsignado: number;
}

export type CrearTicketRequestMapper = (
  state: CrearTicketStepperState,
  catalogos: TicketCatalogos,
) => CrearTicketRequestActualBackend;
```

Nota: `origenTicket` sigue siendo `number` porque el backend actual lo espera asi. El mapper debe buscar `idOrigenTicket` en `catalogos.origenesTicket` y enviar `parametro.valor` o el valor compatible definido por backend.

### Request propuesto a futuro

Este body serviria si el backend decide recibir toda la clasificacion inicial desde la creacion.

```ts
export interface CrearTicketRequestPropuesto {
  codigoCaso: string;
  idOrigenTicket: IdParametroCatalogo;
  titulo: string;
  descripcion: string;
  idUsuarioAsignado: number;

  idTipoCaso: IdParametroCatalogo;
  idPrioridad: IdParametroCatalogo;
  idImpacto?: Nullable<IdParametroCatalogo>;
  idEstadoHistoriaUsuario: IdParametroCatalogo;
  historiaUsuario?: Nullable<string>;
  areaSolicitante?: Nullable<string>;
  procesoAfectado?: Nullable<string>;
  idAmbienteReportado?: Nullable<IdParametroCatalogo>;
  comentarioInicial?: Nullable<string>;
}
```

## Stepper de actualizacion

La actualizacion debe capturar lo que no se sabia al crear el ticket. Este flujo alimenta historico, metricas y diccionario de conocimiento.

Este stepper no debe funcionar como un wizard obligatorio. En la practica es un conjunto de secciones editables: el usuario puede entrar al paso de diagnostico, guardar solo causa raiz, salir, y volver despues a solucion o validacion sin completar los pasos anteriores.

Reglas del flujo:

- Cada paso tiene su propio boton de guardar.
- Ningun paso depende de otro para poder persistirse.
- La seccion de revision es opcional y solo consolida lo que ya fue editado.
- El request de guardado debe ser parcial, no un body completo.
- Si un campo no fue modificado, no deberia enviarse en el patch.

## Guardado temporal de tickets en memoria

Mientras el backend no soporte el nuevo flujo completo, el frontend puede guardar la informacion extendida en memoria.

Reglas:

- El backend sigue recibiendo el body compatible actual cuando sea posible.
- La memoria guarda los campos extendidos de creacion y actualizacion.
- Si el backend falla, el ticket puede crearse con ID temporal `local-*`.
- Los tickets locales solo viven durante la sesion actual de la app.
- El logout debe limpiar el store de memoria.
- No se debe guardar esta informacion en `localStorage`, `sessionStorage`, cookies ni IndexedDB.

```ts
export interface TicketWorkflowMemoryRecord {
  idTicket: string;
  codigoCaso: string;
  origen: 'backend' | 'memoria';
  creadoEn: string;
  actualizadoEn: string;
  creacion: CrearTicketMemoria;
  actualizaciones: ActualizarTicketMemoria[];
}
```

## Catalogos de actualizacion

Estos valores tambien vienen desde backend y se consumen desde `TicketCatalogos`.

| Campo del formulario | Catalogo en memoria |
| --- | --- |
| Severidad del defecto | `catalogos.severidades` |
| Tipo de evidencia | `catalogos.tiposEvidencia` |
| Tipo de cambio tecnico | `catalogos.tiposCambioTecnico` |
| Riesgo del cambio | `catalogos.riesgosCambio` |
| Resultado de validacion | `catalogos.resultadosValidacion` |
| Categoria de conocimiento | `catalogos.categoriasConocimiento` |
| Estado del articulo de conocimiento | `catalogos.estadosArticuloConocimiento` |
| Nivel de reutilizacion | `catalogos.nivelesReutilizacionConocimiento` |

### Step ids

```ts
export type ActualizarTicketStepId =
  | 'diagnostico'
  | 'contextoTecnico'
  | 'solucion'
  | 'validacion'
  | 'conocimiento'
  | 'revision';
```

### Estado de guardado por paso

```ts
export enum StepSaveStatus {
  Limpio = 'LIMPIO',
  Editado = 'EDITADO',
  Guardando = 'GUARDANDO',
  Guardado = 'GUARDADO',
  Error = 'ERROR',
}

export interface StepPersistenceState {
  status: StepSaveStatus;
  valido: boolean;
  guardando: boolean;
  modificado: boolean;
  ultimaFechaGuardado?: Nullable<string>;
  mensajeError?: Nullable<string>;
}
```

### Modelos auxiliares

```ts
export interface TicketEvidenciaInput {
  idTipoEvidencia: IdParametroCatalogo;
  descripcion?: Nullable<string>;
  url?: Nullable<string>;
  contenido?: Nullable<string>;
}

export interface ProyectoInvolucradoInput {
  idProyecto?: Nullable<number>;
  nombre: string;
  esPrincipal?: boolean;
}

export interface RepositorioInvolucradoInput {
  idRepositorio?: Nullable<number>;
  nombre: string;
  url?: Nullable<string>;
  rama?: Nullable<string>;
  esPrincipal?: boolean;
}
```

### Step auxiliar: definicion funcional

```ts
export interface ActualizarTicketDefinicionStep {
  idEstadoHistoriaUsuario?: Nullable<IdParametroCatalogo>;
  historiaUsuario?: Nullable<string>;
}
```

### Step 1: diagnostico

```ts
export interface ActualizarTicketDiagnosticoStep {
  sintomaConfirmado?: Nullable<string>;
  pasosReproduccion?: Nullable<string>;
  idAmbienteConfirmado?: Nullable<IdParametroCatalogo>;
  idSeveridadDefecto?: Nullable<IdParametroCatalogo>;
  causaRaiz?: Nullable<string>;
  evidencias?: TicketEvidenciaInput[];
}
```

### Step 2: contexto tecnico

```ts
export interface ActualizarTicketContextoTecnicoStep {
  proyectosInvolucrados?: ProyectoInvolucradoInput[];
  repositorios?: RepositorioInvolucradoInput[];
  moduloAfectado?: Nullable<string>;
  servicioApi?: Nullable<string>;
  endpoint?: Nullable<string>;
  baseDatos?: Nullable<string>;
  tablaEntidad?: Nullable<string>;
  idTipoCambioTecnico?: Nullable<IdParametroCatalogo>;
}
```

### Step 3: solucion

```ts
export interface ActualizarTicketSolucionStep {
  solucionPropuesta?: Nullable<string>;
  solucionAplicada?: Nullable<string>;
  pullRequestUrl?: Nullable<string>;
  commitId?: Nullable<string>;
  requiereDespliegue?: boolean;
  idRiesgoCambio?: Nullable<IdParametroCatalogo>;
  observacionesTecnicas?: Nullable<string>;
}
```

### Step 4: validacion

```ts
export interface ActualizarTicketValidacionStep {
  idResultadoValidacion?: Nullable<IdParametroCatalogo>;
  idAmbienteValidado?: Nullable<IdParametroCatalogo>;
  evidenciaValidacion?: TicketEvidenciaInput[];
  observacionesQa?: Nullable<string>;
}
```

### Step 5: conocimiento

```ts
export interface ActualizarTicketConocimientoStep {
  idCategoriaConocimiento?: Nullable<IdParametroCatalogo>;
  idEstadoArticuloConocimiento: IdParametroCatalogo;
  resumenConocimiento?: Nullable<string>;
  recomendacionFutura?: Nullable<string>;
  idNivelReutilizacion?: Nullable<IdParametroCatalogo>;
  tags?: string[];
  casosRelacionados?: CodigoCaso[];
}
```

### Estado del stepper de actualizacion

```ts
export interface ActualizarTicketStepperState {
  diagnostico?: ActualizarTicketDiagnosticoStep;
  contextoTecnico?: ActualizarTicketContextoTecnicoStep;
  solucion?: ActualizarTicketSolucionStep;
  validacion?: ActualizarTicketValidacionStep;
  conocimiento?: ActualizarTicketConocimientoStep;
  persistenciaPorPaso: Record<ActualizarTicketStepId, StepPersistenceState>;
}

export type ActualizarTicketStepperDefinition =
  StepperStepDefinition<ActualizarTicketStepId>[];

export type ActualizarTicketPartialState =
  Partial<Omit<ActualizarTicketStepperState, 'persistenciaPorPaso'>>;
```

### Payload por paso

Cada paso debe poder construir su propio patch. Esto evita obligar al usuario a completar diagnostico, solucion y validacion en una sola sesion.

```ts
export interface ActualizarTicketStepPayloadMap {
  diagnostico: ActualizarTicketDiagnosticoStep;
  contextoTecnico: ActualizarTicketContextoTecnicoStep;
  solucion: ActualizarTicketSolucionStep;
  validacion: ActualizarTicketValidacionStep;
  conocimiento: ActualizarTicketConocimientoStep;
  revision: never;
}

export type ActualizarTicketStepPatch<TStepId extends ActualizarTicketStepId> =
  TStepId extends 'revision'
    ? never
    : Partial<ActualizarTicketStepPayloadMap[TStepId]>;

export interface GuardarPasoActualizacionRequest<
  TStepId extends Exclude<ActualizarTicketStepId, 'revision'>,
> {
  idTicket: string;
  paso: TStepId;
  cambios: ActualizarTicketStepPatch<TStepId>;
  comentario?: Nullable<string>;
}
```

### Request actual compatible con backend

Este es el body que el backend soporta actualmente para actualizar ticket.

```ts
export type BackendTicketEstado =
  | 'EnAnalisis'
  | 'EnProceso'
  | 'Bloqueado'
  | 'Entregado'
  | 'DespliegueApitesting'
  | 'EnRevisionApitesting'
  | 'AprobadoApitesting'
  | 'DespligueQA'
  | 'EnRevisionQA'
  | 'AprobadoQA'
  | 'PendienteCertificacion'
  | 'Certificado'
  | 'DespliegueProduccion'
  | 'BUG'
  | 'Rollback';

export interface ActualizarTicketRequestActualBackend {
  titulo?: Nullable<string>;
  descripcion?: Nullable<string>;
  nuevoEstado?: Nullable<BackendTicketEstado>;
  idUsuarioAsignado?: Nullable<number>;
  causaRaiz?: Nullable<string>;
  solucionPropuesta?: Nullable<string>;
  comentario?: Nullable<string>;
}

export type ActualizarTicketRequestMapper = (
  state: ActualizarTicketPartialState,
) => ActualizarTicketRequestActualBackend;
```

### Request propuesto a futuro

Este body permite enviar secciones completas sin perder estructura. Tambien podria dividirse en endpoints separados.

```ts
export interface ActualizarTicketRequestPropuesto {
  titulo?: Nullable<string>;
  descripcion?: Nullable<string>;
  nuevoEstado?: Nullable<BackendTicketEstado>;
  idUsuarioAsignado?: Nullable<number>;
  comentario?: Nullable<string>;

  diagnostico?: Nullable<ActualizarTicketDiagnosticoStep>;
  contextoTecnico?: Nullable<ActualizarTicketContextoTecnicoStep>;
  solucion?: Nullable<ActualizarTicketSolucionStep>;
  validacion?: Nullable<ActualizarTicketValidacionStep>;
  conocimiento?: Nullable<ActualizarTicketConocimientoStep>;
}

export type ActualizarTicketPatchPayload =
  Partial<ActualizarTicketRequestPropuesto>;
```

### Requests parciales por paso

Si se mantiene el endpoint actual de actualizacion, el mapper del frontend debe convertir cada paso al body parcial compatible con backend.

```ts
export type ActualizarTicketBackendPatchPorPaso = {
  diagnostico: Pick<ActualizarTicketRequestActualBackend, 'causaRaiz' | 'comentario'>;
  solucion: Pick<ActualizarTicketRequestActualBackend, 'solucionPropuesta' | 'comentario'>;
  contextoTecnico: Pick<ActualizarTicketRequestActualBackend, 'comentario'>;
  validacion: Pick<ActualizarTicketRequestActualBackend, 'nuevoEstado' | 'comentario'>;
  conocimiento: Pick<ActualizarTicketRequestActualBackend, 'comentario'>;
};

export type ActualizarTicketBackendStepPatch<
  TStepId extends keyof ActualizarTicketBackendPatchPorPaso,
> = Partial<ActualizarTicketBackendPatchPorPaso[TStepId]>;
```

## Endpoints sugeridos a futuro

Si el backend crece, seria mas limpio separar las responsabilidades por endpoint:

```txt
PATCH /api/tickets/{idTicket}/diagnostico
PATCH /api/tickets/{idTicket}/contexto-tecnico
PATCH /api/tickets/{idTicket}/solucion
PATCH /api/tickets/{idTicket}/validacion
PATCH /api/tickets/{idTicket}/conocimiento
```

Tambien se puede conservar un unico endpoint `PATCH /api/tickets/{idTicket}` con secciones opcionales, pero el contrato debe mantenerse igual de explicito.

## Mapeo recomendado

```ts
export function mapCrearTicketActualBackend(
  state: CrearTicketStepperState,
  catalogos: TicketCatalogos,
): CrearTicketRequestActualBackend {
  const origenTicket = catalogos.origenesTicket.find(
    (parametro) => parametro.idParametro === state.caso.idOrigenTicket,
  );

  return {
    codigoCaso: state.caso.codigoCaso,
    origenTicket: Number(origenTicket?.valor ?? origenTicket?.idParametro),
    titulo: state.caso.titulo,
    descripcion: state.caso.descripcion,
    idUsuarioAsignado: state.asignacion.idUsuarioAsignado,
  };
}

export function mapActualizarTicketActualBackend(
  state: ActualizarTicketPartialState,
): ActualizarTicketRequestActualBackend {
  return {
    causaRaiz: state.diagnostico?.causaRaiz,
    solucionPropuesta: state.solucion?.solucionPropuesta,
  };
}
```

## Ubicacion sugerida al implementar

```txt
src/app/models/enums/ticket-stepper.enum.ts
src/app/models/interfaces/catalogo.model.ts
src/app/models/interfaces/ticket-stepper.model.ts
src/app/models/interfaces/ticket-stepper-api.model.ts
src/app/models/mappers/ticket-stepper.mapper.ts
src/app/core/services/catalogo.service.ts
src/app/core/state/catalogo-store.service.ts
```

La regla seria: los componentes consumen `ticket-stepper.model.ts` y `CatalogoStoreService`, los servicios consumen `ticket-stepper-api.model.ts`, y el mapper traduce entre ambos.
