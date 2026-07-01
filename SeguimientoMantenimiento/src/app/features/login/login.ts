import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  public isLoading = false;
  public errorMessage = '';

  credenciales = {
    nombreUsuario: '',
    password: '',
  };

  ejecutarLogin() {
    if (this.credenciales.nombreUsuario && this.credenciales.password) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.credenciales.nombreUsuario, this.credenciales.password).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.errorMessage = 'No fue posible iniciar sesion. Verifica usuario y contrasena.';
          this.isLoading = false;
        },
      });
    }
  }
}
