import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthMockService } from '../../core/services/auth-mock';
import { User } from '../../models/interfaces/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  private authService = inject(AuthMockService);

  isEditable: boolean = false;

  currentUser!: User;
  private backupUser!: User;

  ngOnInit() {
    this.currentUser = {
      idUsuario: '11233233213312',
      nombreUsuario: 'aelsner_exec',
      nombres: 'Amy',
      apellidos: 'Elsner',
      rol: this.authService.getCurrentRole(),
      avatarUrl: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      password: '123456',
      activo: true
    };

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

    console.log('Escribiendo cambios aprobados en la base de datos...', this.currentUser);
    this.cloneBackup();
    this.isEditable = false;
  }

  private cloneBackup() {
    this.backupUser = { ...this.currentUser };
  }
}
