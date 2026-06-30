import { Roles } from '../enums/roles';

export interface User {
  idUsuario: string;
  nombreUsuario: string;
  nombres: string;
  apellidos:string;
  rol: Roles;
  avatarUrl?: string;
  activo: boolean;
  password: string;
}
