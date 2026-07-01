import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from '../../shared/molecules/modal/modal';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';
import { UiGlobalService } from '../../core/services/ui-global';
import { DataTableComponent } from '../../shared/organisms/data-table/data-table';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, Modal, DataTableComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagementComponent implements OnInit {
  public uiService = inject(UiGlobalService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  public RolesEnum = Roles;

  public usuarioLogueadoRol = computed(() => this.authService.currentRole());
  public usuarioLogueadoId = computed(() => this.authService.currentUser()?.idUsuario ?? '');

  public userTableColumns = [
    { key: 'idUsuario', label: 'ID SISTEMA', type: 'code' as const },
    { key: 'nombreUsuario', label: 'USERNAME', type: 'code' as const },
    { key: 'nombres', label: 'NOMBRES' },
    { key: 'apellidos', label: 'APELLIDOS' },
    { key: 'rol', label: 'ROL ASIGNADO', type: 'badge' as const },
    { key: 'activo', label: 'ESTADO', type: 'badge' as const },
  ];

  public usuarios = signal<User[]>([]);

  public modalAbierto = false;
  public modoEdicion = false;
  public usuarioSeleccionado: User = this.inicializarUsuario();

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        if (this.usuarioLogueadoRol() !== Roles.Product_Owner) {
          const propio = data.find((u) => u.idUsuario === this.usuarioLogueadoId());
          if (propio) this.abrirEditor(propio);
        }
      }
    });
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
      this.userService.updateUser(this.usuarioSeleccionado).subscribe({
        next: (updated) => {
          this.usuarios.update((list) =>
            list.map((u) => (u.idUsuario === updated.idUsuario ? updated : u))
          );
        }
      });
    } else {
      this.userService.createUser(this.usuarioSeleccionado).subscribe({
        next: (created) => {
          this.usuarios.update((list) => [created, ...list]);
        }
      });
    }
    this.modalAbierto = false;
  }

  public eliminarUsuario(usuario: User): void {
    if (this.usuarioLogueadoRol() !== Roles.Product_Owner) return;
    this.userService.deleteUser(usuario.idUsuario).subscribe({
      next: () => {
        this.usuarios.update((list) => list.filter((u) => u.idUsuario !== usuario.idUsuario));
      }
    });
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
