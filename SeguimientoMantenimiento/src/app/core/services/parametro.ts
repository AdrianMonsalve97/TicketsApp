import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Parametro } from '../../models/interfaces/parametro.model';
import { API_BASE_URL, ApiResponse } from './api.config';

@Injectable({
  providedIn: 'root',
})
export class ParametroService {
  private http = inject(HttpClient);

  getRoles(): Observable<Parametro[]> {
    return this.getParametros('/roles');
  }

  getEstadosTicket(incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametros('/estados-ticket', incluirInactivos);
  }

  getOrigenesTicket(incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametros('/origenes-ticket', incluirInactivos);
  }

  getAreasTicket(incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametros('/areas-ticket', incluirInactivos);
  }

  private getParametros(path: string, incluirInactivos?: boolean): Observable<Parametro[]> {
    const params =
      incluirInactivos === undefined ? undefined : { incluirInactivos };

    return this.http
      .get<ApiResponse<ParametroDto[]>>(`${API_BASE_URL}/parametros${path}`, { params })
      .pipe(map((response) => response.data.map((parametro) => this.mapParametro(parametro))));
  }

  private mapParametro(parametro: ParametroDto): Parametro {
    return {
      id: parametro.id,
      nombre: parametro.nombre,
      descripcion: parametro.descripcion ?? undefined,
      activo: parametro.activo,
    };
  }
}

interface ParametroDto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}
