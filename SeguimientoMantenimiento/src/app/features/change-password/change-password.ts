import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public isLoading = false;
  public errorMessage = '';
  public successMessage = '';

  public form = {
    actual: '',
    nueva: '',
    confirmar: '',
  };

  cambiar(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.form.actual || !this.form.nueva || !this.form.confirmar) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }
    if (this.form.nueva !== this.form.confirmar) {
      this.errorMessage = 'La nueva contraseña no coincide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.authService.changePassword(user.nombreUsuario, this.form.actual, this.form.nueva).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada. Ya puedes continuar.';
        this.isLoading = false;
        const updated = { ...user, debeCambiarContrasena: false };
        localStorage.setItem('ticketshex_user', JSON.stringify(updated));
        setTimeout(() => this.router.navigateByUrl('/dashboard'), 800);
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar la contraseña.';
        this.isLoading = false;
      },
    });
  }
}
