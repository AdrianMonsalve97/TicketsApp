import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../../models/interfaces/user.model';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';
import { UsuarioDto } from '../../models/interfaces/user-api.model';
import { backendRolToRole, roleToBackendRol } from '../../models/utils/role.utils';

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
    const idUsuario = Number(user.idUsuario);
    return this.http
      .post<ApiResponse<number>>(`${API_BASE_URL}/usuarios`, {
        idUsuario,
        nombreUsuario: user.nombreUsuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: roleToBackendRol(user.rol),
        idArea: user.idArea ?? null,
        imagenPerfilBase64: user.imagenPerfilBase64 ?? null,
      })
      .pipe(map(() => ({ ...user, idUsuario: String(idUsuario), activo: true, bloqueado: false, password: '' })));
  }

  updateUser(user: User): Observable<User> {
    return this.http
      .put<ApiResponse<boolean>>(`${API_BASE_URL}/usuarios/${user.idUsuario}`, {
        nombreUsuario: user.nombreUsuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: roleToBackendRol(user.rol),
        idArea: user.idArea ?? null,
        activo: user.activo,
        imagenPerfilBase64: user.imagenPerfilBase64 ?? null,
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
      rol: backendRolToRole(user.rol),
      activo: user.activo,
      bloqueado: user.bloqueado,
      intentosFallidos: user.intentosFallidos ?? 0,
      fechaBloqueo: user.fechaBloqueo ? new Date(user.fechaBloqueo) : null,
      contrasenaExpiraEn: user.contrasenaExpiraEn ? new Date(user.contrasenaExpiraEn) : null,
      idArea: user.idArea ? Number(user.idArea) : null,
      password: '',
      imagenPerfilBase64: user.imagenPerfilBase64 ?? null,
      avatarUrl: this.toAvatarUrl(user.imagenPerfilBase64),
    };
  }

  private toAvatarUrl(value: string | null | undefined): string {
    if (!value) return '';
    return value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
  }
}
