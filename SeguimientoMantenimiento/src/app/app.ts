import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Topbar } from './core/layout/topbar/topbar';
import { SidebarComponent } from './shared/organisms/sidebar/sidebar';
import { BackgroundGeometryComponent } from './shared/organisms/background-geometry/background-geometry';
import { NavigationStateService } from './core/services/navigation-state';
import { filter } from 'rxjs';
import { ToastHostComponent } from './shared/molecules/toast-host/toast-host';
import { AuthService } from './core/services/auth.service';
import { CatalogoSyncService } from './core/services/catalogo-sync.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, SidebarComponent, BackgroundGeometryComponent, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('SeguimientoMantenimiento');
  protected navState = inject(NavigationStateService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private catalogoSyncService = inject(CatalogoSyncService);
  esRutaLogin = signal<boolean>(this.esLogin(this.router.url));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.esRutaLogin.set(this.esLogin(event.urlAfterRedirects));
    });

    if (this.authService.currentUser()) {
      this.catalogoSyncService.sincronizar().subscribe();
    }
  }

  private esLogin(url: string): boolean {
    return url.includes('/login') || url === '/' || url === '';
  }
}
