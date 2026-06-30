import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { NavigationStateService } from '../../../core/services/navigation-state';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  public RolesEnum = Roles;
  public usuarioLogueadoRol = signal<Roles>(Roles.Product_Owner);

  @ViewChild('drawerRef') drawerRef!: Drawer;

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
