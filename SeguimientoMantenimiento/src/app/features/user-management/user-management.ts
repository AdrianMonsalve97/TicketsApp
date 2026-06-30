import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/molecules/modal/modal';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';
import { UiGlobalService } from '../../core/services/ui-global';
import { DataTableComponent } from '../../shared/organism/data-table/data-table';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, DataTableComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagementComponent implements OnInit {
  public uiService = inject(UiGlobalService);
  public RolesEnum = Roles;

  public usuarioLogueadoRol = signal<Roles>(Roles.Product_Owner);
  public usuarioLogueadoId = signal<string>('USR-102');

  public userTableColumns = [
    { key: 'idUsuario', label: 'ID SISTEMA', type: 'code' as const },
    { key: 'nombreUsuario', label: 'USERNAME', type: 'code' as const },
    { key: 'nombres', label: 'NOMBRES' },
    { key: 'apellidos', label: 'APELLIDOS' },
    { key: 'rol', label: 'ROL ASIGNADO', type: 'badge' as const },
    { key: 'activo', label: 'ESTADO', type: 'badge' as const },
  ];

  public usuarios = signal<User[]>([
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
  ]);

  public modalAbierto = false;
  public modoEdicion = false;
  public usuarioSeleccionado: User = this.inicializarUsuario();

  ngOnInit(): void {
    if (this.usuarioLogueadoRol() !== Roles.Product_Owner) {
      const propio = this.usuarios().find((u) => u.idUsuario === this.usuarioLogueadoId());
      if (propio) this.abrirEditor(propio);
    }
  }

  public kpis = computed(() => {
    const list = this.usuarios();
    return {
      total: list.length,
      activos: list.filter((u) => u.activo).length,
      inactivos: list.filter((u) => !u.activo).length,
      po: list.filter((u) => u.rol === Roles.Product_Owner).length,
      lt: list.filter((u) => u.rol === Roles.Lider_Tecnico).length,
      dev: list.filter((u) => u.rol === Roles.Desarrollador).length,
      qa: list.filter((u) => u.rol === Roles.Qa).length,
    };
  });

  public abrirCreador(): void {
    if (this.usuarioLogueadoRol() !== Roles.Product_Owner) return;
    this.modoEdicion = false;
    this.usuarioSeleccionado = this.inicializarUsuario();
    this.modalAbierto = true;
  }

  public abrirEditor(usuario: User): void {
    if (
      this.usuarioLogueadoRol() !== Roles.Product_Owner &&
      usuario.idUsuario !== this.usuarioLogueadoId()
    ) {
      return;
    }
    this.modoEdicion = true;
    this.usuarioSeleccionado = JSON.parse(JSON.stringify(usuario));
    this.modalAbierto = true;
  }

  public guardarUsuario(): void {
    if (this.modoEdicion) {
      this.usuarios.update((list) =>
        list.map((u) =>
          u.idUsuario === this.usuarioSeleccionado.idUsuario ? { ...this.usuarioSeleccionado } : u,
        ),
      );
    } else {
      const nuevo: User = {
        ...this.usuarioSeleccionado,
        idUsuario: 'USR-' + Math.floor(Math.random() * 900 + 100),
      };
      this.usuarios.update((list) => [nuevo, ...list]);
    }
    this.modalAbierto = false;
  }

  public eliminarUsuario(usuario: User): void {
    if (this.usuarioLogueadoRol() !== Roles.Product_Owner) return;
    this.usuarios.update((list) => list.filter((u) => u.idUsuario !== usuario.idUsuario));
  }

  private inicializarUsuario(): User {
    return {
      idUsuario: '',
      nombreUsuario: '',
      nombres: '',
      apellidos: '',
      rol: Roles.Desarrollador,
      activo: true,
      password: '',
      avatarUrl: '',
    };
  }
}
