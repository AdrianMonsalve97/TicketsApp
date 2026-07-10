export type IdParametroCatalogo = number;
export type CodigoParametroCatalogo = string;
export type TicketCatalogoKey = keyof TicketCatalogos;

export interface ParametroCatalogo {
  idParametro: IdParametroCatalogo;
  codigo: CodigoParametroCatalogo;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  orden: number;
  valor?: string | number | boolean | null;
  simulado?: boolean;
}

export interface TicketCatalogos {
  roles: ParametroCatalogo[];
  estadosTicket: ParametroCatalogo[];
  origenesTicket: ParametroCatalogo[];
  areasTicket: ParametroCatalogo[];
  aplicativos: ParametroCatalogo[];
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

export interface TicketCatalogosResponse {
  version: string;
  fechaActualizacion: string;
  catalogos: TicketCatalogos;
}

export interface CatalogoSelectOption {
  value: IdParametroCatalogo;
  label: string;
  codigo: CodigoParametroCatalogo;
  disabled?: boolean;
}
