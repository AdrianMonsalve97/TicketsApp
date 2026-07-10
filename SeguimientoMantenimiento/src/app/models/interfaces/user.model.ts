import { Roles } from '../enums/roles';

export interface User {
  idUsuario: string;
  nombreUsuario: string;
  nombres: string;
  apellidos: string;
  rol: Roles;
  idArea: number | null;
  imagenPerfilBase64?: string | null;
  avatarUrl?: string;
  activo: boolean;
  bloqueado?: boolean;
  intentosFallidos?: number;
  fechaBloqueo?: Date | null;
  contrasenaExpiraEn?: Date | null;
  password: string;
  debeCambiarContrasena?: boolean;
}
