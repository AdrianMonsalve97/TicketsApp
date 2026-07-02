import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { Roles } from '../../models/enums/roles';
import { User } from '../../models/interfaces/user.model';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';
import { LoginResponseDto } from '../../models/interfaces/auth-api.model';

const TOKEN_KEY = 'ticketshex_token';
const TOKEN_EXPIRATION_KEY = 'ticketshex_token_expiration';
const USER_KEY = 'ticketshex_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _currentUser = signal<User | null>(this.getStoredUser());

  public currentUser = this._currentUser.asReadonly();
  public currentRole = computed(() => this._currentUser()?.rol ?? Roles.Desarrollador);

  login(nombreUsuario: string, contrasena: string) {
    return this.http
      .post<ApiResponse<LoginResponseDto>>(`${API_BASE_URL}/auth/login`, { nombreUsuario, contrasena })
      .pipe(
        map((response) => response.data),
        tap((session) => {
          const user = this.mapAuthenticatedUser(session);
          localStorage.setItem(TOKEN_KEY, session.token);
          localStorage.setItem(TOKEN_EXPIRATION_KEY, session.fechaExpiracion);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._currentUser.set(user);
        }),
      );
  }

  logout(): void {
    const token = this.getTokenWithoutExpirationCheck();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);

    if (token) {
      this.http.post<ApiResponse<boolean>>(`${API_BASE_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } }).subscribe();
    }
  }

  changePassword(nombreUsuario: string, contrasenaActual: string, nuevaContrasena: string) {
    return this.http
      .post<ApiResponse<boolean>>(`${API_BASE_URL}/auth/cambiar-contrasena`, {
        nombreUsuario,
        contrasenaActual,
        nuevaContrasena,
      })
      .pipe(map((response) => response.data));
  }

  initializeAuthentication(user: User) {
    return this.http
      .post<ApiResponse<boolean>>(`${API_BASE_URL}/auth/inicializar`, {
        idUsuario: Number(user.idUsuario),
        nombreUsuario: user.nombreUsuario,
        nombres: user.nombres,
        apellidos: user.apellidos || null,
        idArea: null,
        contrasena: user.password,
      })
      .pipe(map((response) => response.data));
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    if (!token || !expiration || new Date(expiration) <= new Date()) {
      this.logout();
      return null;
    }
    return token;
  }

  changeRole(newRole: Roles): void {
    this._currentUser.update((user) => {
      if (!user) return null;
      const updated = { ...user, rol: newRole };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  getCurrentRole(): Roles {
    return this.currentRole();
  }

  getUserId(): string | undefined {
    return this._currentUser()?.idUsuario;
  }

  getUserRole(): string | undefined {
    return this._currentUser()?.rol;
  }

  private getStoredUser(): User | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !expiration || !rawUser || new Date(expiration) <= new Date()) {
      return null;
    }
    const stored = JSON.parse(rawUser) as User;
    return {
      ...stored,
      avatarUrl: '',
    };
  }

  private getTokenWithoutExpirationCheck(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private mapAuthenticatedUser(session: LoginResponseDto): User {
    const roleFromToken = this.extractRoleFromToken(session.token) ?? session.usuario.rol;
      return {
      idUsuario: String(session.usuario.idUsuario),
      nombreUsuario: session.usuario.nombreUsuario,
      nombres: session.usuario.nombres,
      apellidos: '',
      rol: this.mapRol(roleFromToken),
      idArea: null,
      activo: true,
      password: '',
      debeCambiarContrasena: session.usuario.debeCambiarContrasena ?? false,
      avatarUrl: '',
    };
  }

  private mapRol(rol: string): Roles {
    const normalized = (rol ?? '').toString().trim().toLowerCase();
    const roles: Record<string, Roles> = {
      Desarrollador: Roles.Desarrollador,
      Developer: Roles.Desarrollador,
      QA: Roles.Qa,
      LiderTecnico: Roles.Lider_Tecnico,
      Planner: Roles.Product_Owner,
      desarrollador: Roles.Desarrollador,
      qa: Roles.Qa,
      lidertecnico: Roles.Lider_Tecnico,
      planner: Roles.Product_Owner,
    };
    return roles[rol] ?? roles[normalized] ?? Roles.Desarrollador;
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = atob(padded);
      const claims = JSON.parse(decoded) as Record<string, unknown>;
      return (
        (claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | undefined) ??
        (claims['role'] as string | undefined) ??
        null
      );
    } catch {
      return null;
    }
  }
}
