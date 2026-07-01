import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const apiBaseUrl = process.env.RENDER_API_BASE_URL ?? 'https://localhost:7002/api';
const targetPath = resolve('src/app/core/services/api.config.ts');

const content = `export const API_BASE_URL = '${apiBaseUrl}';

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
`;

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, content);
