export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResult<T> {
  elementos: T[];
  pagina: number;
  tamanoPagina: number;
  totalElementos: number;
  totalPaginas: number;
}
