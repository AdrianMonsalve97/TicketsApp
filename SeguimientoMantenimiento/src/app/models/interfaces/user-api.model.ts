import { BackendRol } from './auth-api.model';

export interface UsuarioDto {
  idUsuario: number;
  nombreUsuario: string;
  nombres: string;
  apellidos?: string | null;
  rol: BackendRol;
  idArea?: string | null;
  activo: boolean;
  bloqueado: boolean;
}
