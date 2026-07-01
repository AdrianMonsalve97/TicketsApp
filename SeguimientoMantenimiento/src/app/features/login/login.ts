import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);

  credenciales = {
    nombreUsuario: '',
    password: '',
  };

  ejecutarLogin() {
    if (this.credenciales.nombreUsuario && this.credenciales.password) {
      console.log('Firma criptográfica válida para:', this.credenciales.nombreUsuario);
      this.router.navigate(['/dashboard']);
    }
  }
}
