import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { CatalogoStoreService } from '../state/catalogo-store.service';
import { ParametroService } from './parametro';
import { ToastService } from './toast.service';
import {
  AplicativoParametro,
  Parametro,
  ParametricosGrupoDto,
} from '../../models/interfaces/parametro.model';
import {
  ParametroCatalogo,
  TicketCatalogos,
  TicketCatalogosResponse,
} from '../../models/interfaces/catalogo.model';
import {
  MOCK_AMBIENTES,
  MOCK_CATEGORIAS_CONOCIMIENTO,
  MOCK_ESTADOS_ARTICULO_CONOCIMIENTO,
  MOCK_ESTADOS_HISTORIA_USUARIO,
  MOCK_IMPACTOS,
  MOCK_NIVELES_REUTILIZACION_CONOCIMIENTO,
  MOCK_PRIORIDADES,
  MOCK_RESULTADOS_VALIDACION,
  MOCK_RIESGOS_CAMBIO,
  MOCK_SEVERIDADES,
  MOCK_TIPOS_CAMBIO_TECNICO,
  MOCK_TIPOS_CASO,
  MOCK_TIPOS_EVIDENCIA,
} from '../../models/constants/mock-ticket-catalogos';

const SYNC_TOAST_ID = 'catalogos-sync';

@Injectable({ providedIn: 'root' })
export class CatalogoSyncService {
  private readonly parametroService = inject(ParametroService);
  private readonly store = inject(CatalogoStoreService);
  private readonly toast = inject(ToastService);
  private syncRequest$?: Observable<TicketCatalogosResponse | null>;

  sincronizar(): Observable<TicketCatalogosResponse | null> {
    if (this.store.sincronizado()) {
      return of(null);
    }

    if (this.syncRequest$) {
      return this.syncRequest$;
    }

    this.store.iniciarSincronizacion();
    this.toast.loading(
      SYNC_TOAST_ID,
      'Sincronizando parametros...',
      'Preparando catalogos de la aplicacion.',
    );

    this.syncRequest$ = this.parametroService.getParametricos().pipe(
      map((grupos) => this.buildResponse(grupos)),
      tap((response) => {
        this.store.hydrate(response);
        this.toast.dismiss(SYNC_TOAST_ID);
      }),
      catchError(() => {
        const mensaje = 'No pudimos sincronizar los parametros.';
        this.store.marcarError(mensaje);
        this.toast.error(
          SYNC_TOAST_ID,
          mensaje,
          'Reintenta la sincronizacion o cierra sesion.',
          'Reintentar',
          () => this.reintentar(),
        );
        return of(null);
      }),
      finalize(() => {
        this.syncRequest$ = undefined;
      }),
      shareReplay(1),
    );

    return this.syncRequest$;
  }

  limpiar(): void {
    this.syncRequest$ = undefined;
    this.store.clear();
    this.toast.dismiss(SYNC_TOAST_ID);
  }

  private reintentar(): void {
    this.syncRequest$ = undefined;
    this.sincronizar().subscribe();
  }

  private buildResponse(grupos: ParametricosGrupoDto[]): TicketCatalogosResponse {
    const fechaActualizacion = new Date().toISOString();
    const catalogos: TicketCatalogos = {
      roles: this.mapParametros(this.getItems<Parametro>(grupos, 'roles')),
      estadosTicket: this.mapParametros(this.getItems<Parametro>(grupos, 'estadosTicket')),
      origenesTicket: this.mapParametros(this.getItems<Parametro>(grupos, 'origenesTicket'), true),
      areasTicket: this.mapParametros(this.getItems<Parametro>(grupos, 'areas')),
      aplicativos: this.mapAplicativos(this.getItems<AplicativoParametro>(grupos, 'aplicativos')),
      tiposCaso: MOCK_TIPOS_CASO,
      prioridades: MOCK_PRIORIDADES,
      impactos: MOCK_IMPACTOS,
      estadosHistoriaUsuario: MOCK_ESTADOS_HISTORIA_USUARIO,
      ambientes: MOCK_AMBIENTES,
      severidades: MOCK_SEVERIDADES,
      tiposEvidencia: MOCK_TIPOS_EVIDENCIA,
      tiposCambioTecnico: MOCK_TIPOS_CAMBIO_TECNICO,
      riesgosCambio: MOCK_RIESGOS_CAMBIO,
      resultadosValidacion: MOCK_RESULTADOS_VALIDACION,
      categoriasConocimiento: MOCK_CATEGORIAS_CONOCIMIENTO,
      estadosArticuloConocimiento: MOCK_ESTADOS_ARTICULO_CONOCIMIENTO,
      nivelesReutilizacionConocimiento: MOCK_NIVELES_REUTILIZACION_CONOCIMIENTO,
    };

    return {
      version: `frontend-sync-${fechaActualizacion}`,
      fechaActualizacion,
      catalogos,
    };
  }

  private getItems<T>(grupos: ParametricosGrupoDto[], nombre: string): T[] {
    const grupo = grupos.find((item) => item.nombre === nombre);
    return Array.isArray(grupo?.items) ? (grupo.items as T[]) : [];
  }

  private mapParametros(parametros: Parametro[], valorEsId = false): ParametroCatalogo[] {
    return parametros.map((parametro, index) => ({
      idParametro: parametro.id,
      codigo: this.toCodigo(parametro.nombre),
      nombre: parametro.nombre,
      descripcion: parametro.descripcion ?? null,
      activo: parametro.activo,
      orden: index + 1,
      valor: valorEsId ? parametro.id : null,
      simulado: false,
    }));
  }

  private mapAplicativos(aplicativos: AplicativoParametro[]): ParametroCatalogo[] {
    return aplicativos.map((aplicativo, index) => ({
      idParametro: index + 1,
      codigo: this.toCodigo(aplicativo.nombre),
      nombre: aplicativo.nombre,
      descripcion: aplicativo.descripcion ?? null,
      activo: aplicativo.activo,
      orden: index + 1,
      valor: aplicativo.idAplicativo,
      simulado: false,
    }));
  }

  private toCodigo(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }
}
