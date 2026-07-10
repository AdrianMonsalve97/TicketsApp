import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ParametroService } from '../../core/services/parametro';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../models/interfaces/user.model';
import { Parametro } from '../../models/interfaces/parametro.model';
import { Roles } from '../../models/enums/roles';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private parametroService = inject(ParametroService);
  private toastService = inject(ToastService);

  public isEditable = false;
  public isLoading = false;
  public currentUser: User = this.emptyUser();
  public areas: Parametro[] = [];

  private backupUser: User = this.emptyUser();

  ngOnInit(): void {
    const userSession = this.authService.currentUser();
    if (!userSession) return;

    this.currentUser = { ...userSession };
    this.cloneBackup();
    this.cargarAreas();
    this.cargarUsuarioCompleto(userSession.idUsuario);
  }

  habilitarEdicion(): void {
    this.isEditable = true;
  }

  cancelarEdicion(): void {
    this.currentUser = { ...this.backupUser };
    this.isEditable = false;
  }

  guardarInformacion(): void {
    if (!this.currentUser.nombreUsuario.trim() || !this.currentUser.nombres.trim()) {
      this.toastService.warning('profile-validation', 'Datos incompletos', 'Nombre de usuario y nombres son obligatorios.');
      return;
    }

    this.isLoading = true;
    this.userService.updateUser(this.currentUser).subscribe({
      next: (updated) => {
        this.currentUser = { ...updated };
        this.authService.actualizarUsuarioSesion(updated);
        this.cloneBackup();
        this.isEditable = false;
        this.toastService.success('profile-updated', 'Perfil actualizado', 'Tus datos quedaron sincronizados.');
      },
      error: () => {
        this.toastService.error(
          'profile-update-error',
          'No se pudo actualizar el perfil',
          'El backend rechazo la actualizacion para este usuario o rol.',
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onImagenPerfilSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      this.currentUser.imagenPerfilBase64 = result.includes(',') ? result.split(',')[1] : result;
      this.currentUser.avatarUrl = this.avatarUrl();
    };
    reader.readAsDataURL(file);
  }

  limpiarImagenPerfil(): void {
    this.currentUser.imagenPerfilBase64 = null;
    this.currentUser.avatarUrl = '';
  }

  avatarUrl(): string {
    const imagen = this.currentUser.imagenPerfilBase64;
    if (imagen) return imagen.startsWith('data:') ? imagen : `data:image/png;base64,${imagen}`;
    return this.currentUser.avatarUrl || '';
  }

  iniciales(): string {
    return (this.currentUser.nombres || this.currentUser.nombreUsuario || 'U')
      .trim()
      .slice(0, 2)
      .toUpperCase();
  }

  areaNombre(): string {
    if (!this.currentUser.idArea) return 'Sin area';
    return this.areas.find((area) => area.id === this.currentUser.idArea)?.nombre ?? 'Sin area';
  }

  private cargarUsuarioCompleto(idUsuario: string): void {
    this.userService.getUserById(idUsuario).subscribe({
      next: (user) => {
        this.currentUser = { ...this.currentUser, ...user };
        this.authService.actualizarUsuarioSesion(user);
        this.cloneBackup();
      },
    });
  }

  private cargarAreas(): void {
    this.parametroService.getAreasTicket().subscribe({
      next: (areas) => {
        this.areas = areas;
      },
    });
  }

  private cloneBackup(): void {
    this.backupUser = { ...this.currentUser };
  }

  private emptyUser(): User {
    return {
      idUsuario: '',
      nombreUsuario: '',
      nombres: '',
      apellidos: '',
      rol: Roles.Desarrollador,
      idArea: null,
      imagenPerfilBase64: null,
      avatarUrl: '',
      password: '',
      activo: true,
      bloqueado: false,
      intentosFallidos: 0,
      fechaBloqueo: null,
      contrasenaExpiraEn: null,
    };
  }
}
