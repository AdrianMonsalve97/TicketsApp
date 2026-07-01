export const API_BASE_URL = 'https://localhost:7002/api';

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
