import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/interfaces/user.model';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);

  isEditable: boolean = false;

  currentUser!: User;
  private backupUser!: User;

  ngOnInit() {
    const userSession = this.authService.currentUser();
    if (userSession) {
      this.currentUser = { ...userSession };
    } else {
      this.currentUser = {
        idUsuario: '11233233213312',
        nombreUsuario: 'aelsner_exec',
        nombres: 'Amy',
        apellidos: 'Elsner',
        rol: this.authService.getCurrentRole(),
        idArea: null,
        avatarUrl: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
        password: '123456',
        activo: true
      };
    }

    this.cloneBackup();
  }

  habilitarEdicion() {
    this.isEditable = true;
  }

  cancelarEdicion() {
    this.currentUser = { ...this.backupUser };
    this.isEditable = false;
  }

  guardarInformacion() {

    this.cloneBackup();
    this.isEditable = false;
  }

  private cloneBackup() {
    this.backupUser = { ...this.currentUser };
  }
}
