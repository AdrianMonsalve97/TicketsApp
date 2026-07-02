import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Parametro } from '../../models/interfaces/parametro.model';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';

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
      .get<ApiResponse<Parametro[]>>(`${API_BASE_URL}/parametros${path}`, { params })
      .pipe(map((response) => response.data));
  }
}
