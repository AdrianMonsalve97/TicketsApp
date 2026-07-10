import { BackendRol } from './auth-api.model';

export interface UsuarioDto {
  idUsuario: number;
  nombreUsuario: string;
  nombres: string;
  apellidos?: string | null;
  rol: BackendRol;
  idArea?: string | number | null;
  imagenPerfilBase64?: string | null;
  activo: boolean;
  bloqueado: boolean;
  intentosFallidos?: number;
  fechaBloqueo?: string | null;
  contrasenaExpiraEn?: string | null;
}
