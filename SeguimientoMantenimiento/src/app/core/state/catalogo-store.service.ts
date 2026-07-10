import { Injectable, computed, signal } from '@angular/core';
import { CatalogoSyncStatus } from '../../models/enums/catalogo-sync-status';
import {
  CatalogoSelectOption,
  IdParametroCatalogo,
  ParametroCatalogo,
  TicketCatalogoKey,
  TicketCatalogos,
  TicketCatalogosResponse,
} from '../../models/interfaces/catalogo.model';

interface CatalogoStoreState {
  status: CatalogoSyncStatus;
  cargado: boolean;
  cargando: boolean;
  version: string | null;
  fechaCarga: string | null;
  catalogos: TicketCatalogos | null;
  error: string | null;
}

const initialState: CatalogoStoreState = {
  status: CatalogoSyncStatus.Idle,
  cargado: false,
  cargando: false,
  version: null,
  fechaCarga: null,
  catalogos: null,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class CatalogoStoreService {
  private readonly stateSignal = signal<CatalogoStoreState>(initialState);

  public readonly state = this.stateSignal.asReadonly();
  public readonly catalogos = computed(() => this.stateSignal().catalogos);
  public readonly status = computed(() => this.stateSignal().status);
  public readonly cargado = computed(() => this.stateSignal().cargado);
  public readonly cargando = computed(() => this.stateSignal().cargando);
  public readonly sincronizado = computed(() => this.stateSignal().status === CatalogoSyncStatus.Sincronizado);

  iniciarSincronizacion(): void {
    this.stateSignal.update((state) => ({
      ...state,
      status: CatalogoSyncStatus.Sincronizando,
      cargando: true,
      error: null,
    }));
  }

  hydrate(response: TicketCatalogosResponse): void {
    this.stateSignal.set({
      status: CatalogoSyncStatus.Sincronizado,
      cargado: true,
      cargando: false,
      version: response.version,
      fechaCarga: response.fechaActualizacion,
      catalogos: response.catalogos,
      error: null,
    });
  }

  marcarError(error: string): void {
    this.stateSignal.update((state) => ({
      ...state,
      status: CatalogoSyncStatus.Error,
      cargando: false,
      error,
    }));
  }

  clear(): void {
    this.stateSignal.set(initialState);
  }

  getCatalogo(key: TicketCatalogoKey): ParametroCatalogo[] {
    return this.stateSignal().catalogos?.[key] ?? [];
  }

  findById(key: TicketCatalogoKey, idParametro: IdParametroCatalogo): ParametroCatalogo | null {
    return this.getCatalogo(key).find((parametro) => parametro.idParametro === idParametro) ?? null;
  }

  findByCodigo(key: TicketCatalogoKey, codigo: string): ParametroCatalogo | null {
    return this.getCatalogo(key).find((parametro) => parametro.codigo === codigo) ?? null;
  }

  toSelectOptions(key: TicketCatalogoKey): CatalogoSelectOption[] {
    return this.getCatalogo(key)
      .filter((parametro) => parametro.activo)
      .sort((a, b) => a.orden - b.orden)
      .map((parametro) => ({
        value: parametro.idParametro,
        label: parametro.nombre,
        codigo: parametro.codigo,
        disabled: !parametro.activo,
      }));
  }
}
