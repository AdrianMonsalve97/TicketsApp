import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiGlobalService {
  private elementosBloqueantes = signal<number>(0);

  // Canal reactivo global que escuchará el Layout / Dashboard
  public debeDesenfocarFondo = computed(() => this.elementosBloqueantes() > 0);

  public incrementarBloqueo(): void {
    this.elementosBloqueantes.update((n) => n + 1);
  }

  public decrementarBloqueo(): void {
    this.elementosBloqueantes.update((n) => Math.max(0, n - 1));
  }
}
