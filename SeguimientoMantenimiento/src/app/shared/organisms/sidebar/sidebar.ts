import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStateService } from '../../../core/services/navigation-state';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthMockService } from '../../../core/services/auth-mock';
import { Roles } from '../../../models/enums/roles';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  protected navState = inject(NavigationStateService);
  private authService = inject(AuthMockService);

  public RolesEnum = Roles;
  public usuarioLogueadoRol = computed(() => this.authService.currentRole());

  get visible(): boolean {
    return this.navState.isSidebarVisible();
  }

  set visible(value: boolean) {
    this.navState.setSidebarVisible(value);
  }

  closeCallback(event: Event): void {
    this.navState.setSidebarVisible(false);
  }
}
