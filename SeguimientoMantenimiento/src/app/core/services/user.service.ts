import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Roles } from '../../models/enums/roles';
import { User } from '../../models/interfaces/user.model';
import { API_BASE_URL, ApiResponse } from './api.config';

interface UsuarioDto {
  idUsuario: number;
  nombreUsuario: string;
  nombres: string;
  apellidos?: string | null;
  rol: BackendRol;
  idArea?: string | null;
  activo: boolean;
  bloqueado: boolean;
}

type BackendRol = 'Desarrollador' | 'QA' | 'LiderTecnico' | 'Planner';
type BackendArea = 1 | 2 | 3;

const ROL_BACKEND: Record<Roles, BackendRol> = {
  [Roles.Desarrollador]: 'Desarrollador',
  [Roles.Qa]: 'QA',
  [Roles.Lider_Tecnico]: 'LiderTecnico',
  [Roles.Product_Owner]: 'Planner',
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http
      .get<ApiResponse<UsuarioDto[]>>(`${API_BASE_URL}/usuarios`, { params: { incluirInactivos: true } })
      .pipe(map((response) => response.data.map((user) => this.mapUser(user))));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<UsuarioDto>>(`${API_BASE_URL}/usuarios/${id}`).pipe(map((response) => this.mapUser(response.data)));
  }

  createUser(user: User): Observable<User> {
    const idUsuario = Number(user.idUsuario || Math.floor(1000 + Math.random() * 9000));
    return this.http
      .post<ApiResponse<number>>(`${API_BASE_URL}/usuarios`, {
        idUsuario,
        nombreUsuario: user.nombreUsuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: this.mapRolToBackend(user.rol),
        idArea: null as BackendArea | null,
        contrasena: user.password || '123456',
      })
      .pipe(map(() => ({ ...user, idUsuario: String(idUsuario), password: '' })));
  }

  updateUser(user: User): Observable<User> {
    return this.http
      .put<ApiResponse<boolean>>(`${API_BASE_URL}/usuarios/${user.idUsuario}`, {
        nombreUsuario: user.nombreUsuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: this.mapRolToBackend(user.rol),
        idArea: null as BackendArea | null,
        activo: user.activo,
      })
      .pipe(map(() => ({ ...user, password: '' })));
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${API_BASE_URL}/usuarios/${id}`).pipe(map((response) => response.data));
  }

  unlockUser(id: string): Observable<boolean> {
    return this.http.patch<ApiResponse<boolean>>(`${API_BASE_URL}/usuarios/${id}/desbloquear`, {}).pipe(map((response) => response.data));
  }

  private mapUser(user: UsuarioDto): User {
    return {
      idUsuario: String(user.idUsuario),
      nombreUsuario: user.nombreUsuario,
      nombres: user.nombres,
      apellidos: user.apellidos ?? '',
      rol: this.mapRolFromBackend(user.rol),
      activo: user.activo && !user.bloqueado,
      password: '',
      avatarUrl: '',
    };
  }

  private mapRolFromBackend(rol: BackendRol): Roles {
    const roles: Record<BackendRol, Roles> = {
      Desarrollador: Roles.Desarrollador,
      QA: Roles.Qa,
      LiderTecnico: Roles.Lider_Tecnico,
      Planner: Roles.Product_Owner,
    };
    return roles[rol] ?? Roles.Desarrollador;
  }

  private mapRolToBackend(rol: Roles): BackendRol {
    return ROL_BACKEND[rol] ?? 'Desarrollador';
  }
}
