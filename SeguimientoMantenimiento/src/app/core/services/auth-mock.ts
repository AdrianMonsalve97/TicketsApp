import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Roles } from '../../models/enums/roles';
@Injectable({
  providedIn: 'root',
})
export class AuthMockService {
  private currentRoleSubject = new BehaviorSubject<Roles>(Roles.Desarrollador);

  public currentRole$ = this.currentRoleSubject.asObservable();

  constructor() {}

  changeRole(newRole: Roles): void {
    this.currentRoleSubject.next(newRole);
    console.log(`[AuthMock] Rol cambiado a: ${newRole}`);
  }

  getCurrentRole(): Roles {
    return this.currentRoleSubject.value;
  }
}
