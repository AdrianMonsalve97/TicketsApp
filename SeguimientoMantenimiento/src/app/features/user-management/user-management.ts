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
import { LogoLoaderComponent } from '../../shared/atoms/logo-loader/logo-loader';
import { ParametroService } from '../../core/services/parametro';
import { Parametro } from '../../models/interfaces/parametro.model';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, Modal, DataTableComponent, LogoLoaderComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagementComponent implements OnInit {
  public uiService = inject(UiGlobalService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private parametroService = inject(ParametroService);

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
  public areas = signal<Parametro[]>([]);

  public modalAbierto = false;
  public modalCredencialesAbierto = false;
  public modalErrorAbierto = false;
  public isLoading = false;
  public errorMessage = '';
  public modoEdicion = false;
  public usuarioSeleccionado: User = this.inicializarUsuario();
  public credencialesCreacion: { nombreUsuario: string; contrasena: string } | null = null;

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
    this.parametroService.getAreasTicket().subscribe({
      next: (areas) => this.areas.set(areas),
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
    const validacion = this.validarUsuario();
    if (validacion) {
      this.errorMessage = validacion;
      this.modalErrorAbierto = true;
      return;
    }

    this.isLoading = true;
    if (this.modoEdicion) {
      this.userService.updateUser(this.usuarioSeleccionado).subscribe({
        next: (updated) => {
          this.usuarios.update((list) =>
            list.map((u) => (u.idUsuario === updated.idUsuario ? updated : u))
          );
          this.cerrarFormulario();
        },
        error: (error) => {
          this.manejarError(error, 'No fue posible actualizar el usuario.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.userService.createUser(this.usuarioSeleccionado).subscribe({
        next: (created) => {
          this.usuarios.update((list) => [created, ...list]);
          this.credencialesCreacion = {
            nombreUsuario: created.nombreUsuario,
            contrasena: this.usuarioSeleccionado.password || '123456',
          };
          this.cerrarFormulario();
          this.modalCredencialesAbierto = true;
        },
        error: (error) => {
          this.manejarError(error, 'No fue posible crear el usuario.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  public cerrarModalCredenciales(): void {
    this.modalCredencialesAbierto = false;
    this.credencialesCreacion = null;
  }

  public cerrarModalError(): void {
    this.modalErrorAbierto = false;
    this.errorMessage = '';
  }

  public copiarTexto(valor: string): void {
    if (!valor) return;
    void navigator.clipboard.writeText(valor);
  }

  private cerrarFormulario(): void {
    this.modalAbierto = false;
  }

  private validarUsuario(): string | null {
    if (!String(this.usuarioSeleccionado.nombreUsuario ?? '').trim()) return 'El nombre de usuario es obligatorio.';
    if (!String(this.usuarioSeleccionado.nombres ?? '').trim()) return 'Los nombres son obligatorios.';
    if (!String(this.usuarioSeleccionado.idUsuario ?? '').trim()) return 'El ID de usuario es obligatorio.';
    if (!this.usuarioSeleccionado.rol) return 'Debes seleccionar un rol.';
    if (!this.modoEdicion && !String(this.usuarioSeleccionado.password ?? '').trim()) return 'La contrase?a inicial es obligatoria para crear el usuario.';
    return null;
  }

  private manejarError(error: unknown, fallback: string): void {
    console.error(error);
    this.isLoading = false;
    this.errorMessage = fallback;
    this.modalErrorAbierto = true;
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
      idArea: null,
      activo: true,
      password: '',
      debeCambiarContrasena: true,
      avatarUrl: '',
    };
  }
}

