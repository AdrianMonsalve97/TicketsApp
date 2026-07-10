import { Injectable, signal } from '@angular/core';
import { Repository } from '../../models/interfaces/repository.model';

type AplicacionRepositorioState = Record<string, string[]>;

@Injectable({ providedIn: 'root' })
export class AplicacionRepositorioStoreService {
  private readonly storageKey = 'casetrack_application_repository_links';
  private readonly linksSignal = signal<AplicacionRepositorioState>(this.loadLinks());

  public readonly links = this.linksSignal.asReadonly();

  obtenerRepositorios(idAplicativo: string | null | undefined): string[] {
    if (!idAplicativo) return [];
    return this.linksSignal()[idAplicativo] ?? [];
  }

  obtenerRepositoriosRelacionados(
    idAplicativo: string | null | undefined,
    repositorios: Repository[],
  ): Repository[] {
    const ids = new Set(this.obtenerRepositorios(idAplicativo));
    if (!ids.size) return [];
    return repositorios.filter((repositorio) => ids.has(repositorio.idRepositorio));
  }

  guardarRepositorios(idAplicativo: string, repositorios: string[]): void {
    const uniqueRepositorios = [...new Set(repositorios.filter(Boolean))];
    this.linksSignal.update((links) => {
      const nextLinks = {
        ...links,
        [idAplicativo]: uniqueRepositorios,
      };
      this.persistLinks(nextLinks);
      return nextLinks;
    });
  }

  clear(): void {
    this.linksSignal.set({});
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // El estado en memoria ya quedo limpio.
    }
  }

  private loadLinks(): AplicacionRepositorioState {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as AplicacionRepositorioState) : {};
    } catch {
      return {};
    }
  }

  private persistLinks(links: AplicacionRepositorioState): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(links));
    } catch {
      // La persistencia en sesion es auxiliar; el signal sigue vivo.
    }
  }
}
