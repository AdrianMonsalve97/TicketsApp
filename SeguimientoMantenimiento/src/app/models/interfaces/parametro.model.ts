export interface Parametro {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface AplicativoParametro {
  idAplicativo: string;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface ParametricosGrupoDto {
  nombre: string;
  items: unknown[];
}
