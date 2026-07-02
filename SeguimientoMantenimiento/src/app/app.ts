import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Topbar } from './core/layout/topbar/topbar';
import { SidebarComponent } from './shared/organisms/sidebar/sidebar';
import { BackgroundGeometryComponent } from './shared/organisms/background-geometry/background-geometry';
import { NavigationStateService } from './core/services/navigation-state';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, SidebarComponent, BackgroundGeometryComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('SeguimientoMantenimiento');
  protected navState = inject(NavigationStateService);
  private router = inject(Router);
  esRutaLogin = signal<boolean>(this.esLogin(this.router.url));

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.esRutaLogin.set(this.esLogin(event.urlAfterRedirects));
    });

  }

  private esLogin(url: string): boolean {
    return url.includes('/login') || url === '/' || url === '';
  }
}
