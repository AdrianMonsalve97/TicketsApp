import { Roles } from '../enums/roles';

export interface User {
  idUsuario: string;
  nombreUsuario: string;
  nombres: string;
  apellidos: string;
  rol: Roles;
  idArea: number | null;
  avatarUrl?: string;
  activo: boolean;
  password: string;
  debeCambiarContrasena?: boolean;
}
