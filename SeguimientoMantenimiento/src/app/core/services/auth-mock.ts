import { Injectable, signal, computed } from '@angular/core';
import { Roles } from '../../models/enums/roles';
import { User } from '../../models/interfaces/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthMockService {
  // Simulamos un usuario inicial logueado
  private _currentUser = signal<User | null>({
    idUsuario: 'USR-102',
    nombreUsuario: 'hamilton.dev',
    nombres: 'Hamilton',
    apellidos: 'Depablos',
    rol: Roles.Desarrollador,
    activo: true,
    password: '123456',
    avatarUrl: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
  });

  public currentUser = this._currentUser.asReadonly();
  public currentRole = computed(() => this._currentUser()?.rol ?? Roles.Desarrollador);

  changeRole(newRole: Roles): void {
    this._currentUser.update((user) => {
      if (user) {
        return { ...user, rol: newRole };
      }
      return null;
    });
    console.log(`[AuthMock] Rol cambiado a: ${newRole}`);
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
}
