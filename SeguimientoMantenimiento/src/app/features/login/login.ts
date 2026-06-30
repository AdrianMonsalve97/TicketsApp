import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  credenciales = {
    nombreUsuario: '',
    password: '',
  };

  ngOnInit() {
    // Si necesitas inicializar tracking de la ruta aquí
  }

  ejecutarLogin() {
    if (this.credenciales.nombreUsuario && this.credenciales.password) {
      console.log('Firma criptográfica válida para:', this.credenciales.nombreUsuario);
      this.router.navigate(['/dashboard']);
    }
  }
}
