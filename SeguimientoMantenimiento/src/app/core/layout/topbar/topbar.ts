import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthMockService } from '../../services/auth-mock';
import { Roles } from '../../../models/enums/roles';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { PopoverModule, Popover } from 'primeng/popover';



@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule,
    OverlayBadge,
    BadgeModule,
    ButtonModule,
    PopoverModule,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private authService = inject(AuthMockService);
  @ViewChild('op') popoverComponent!: Popover;
  isDarkMode: boolean = true;

  selectedRole: Roles = this.authService.getCurrentRole();

  onRoleChange(newRole: Roles) {
    this.authService.changeRole(newRole);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (!this.isDarkMode) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }

  alternarPopover(event: Event) {
    if (this.popoverComponent) {
      this.popoverComponent.toggle(event);
    }
  }
}
