import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';

@Injectable({
  providedIn: 'root',
})
export class UserMockService {
  private users: User[] = [
    {
      idUsuario: 'USR-101',
      nombreUsuario: 'pmo.admin',
      nombres: 'Director',
      apellidos: 'De Proyecto',
      rol: Roles.Product_Owner,
      activo: true,
      password: '123456',
      avatarUrl: '',
    },
    {
      idUsuario: 'USR-102',
      nombreUsuario: 'hamilton.dev',
      nombres: 'Hamilton',
      apellidos: 'Depablos',
      rol: Roles.Desarrollador,
      activo: true,
      password: '123456',
      avatarUrl: '',
    },
    {
      idUsuario: 'USR-103',
      nombreUsuario: 'brayan.qa',
      nombres: 'Brayan',
      apellidos: 'Testing',
      rol: Roles.Qa,
      activo: true,
      password: '123456',
      avatarUrl: '',
    },
    {
      idUsuario: 'USR-104',
      nombreUsuario: 'miguel.lt',
      nombres: 'Miguel',
      apellidos: 'Líder',
      rol: Roles.Lider_Tecnico,
      password: '123456',
      activo: false,
      avatarUrl: '',
    },
  ];

  getUsers(): Observable<User[]> {
    return of(this.users);
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.idUsuario === id);
  }

  createUser(user: User): Observable<User> {
    const newUser = { ...user, idUsuario: 'USR-' + Math.floor(Math.random() * 900 + 100) };
    this.users.unshift(newUser);
    return of(newUser);
  }

  updateUser(user: User): Observable<User> {
    this.users = this.users.map((u) => u.idUsuario === user.idUsuario ? user : u);
    return of(user);
  }

  deleteUser(id: string): Observable<boolean> {
    this.users = this.users.filter((u) => u.idUsuario !== id);
    return of(true);
  }
}
