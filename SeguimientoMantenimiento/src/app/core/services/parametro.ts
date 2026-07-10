import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Parametro, ParametricosGrupoDto } from '../../models/interfaces/parametro.model';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ParametroService {
  private http = inject(HttpClient);

  getParametricos(): Observable<ParametricosGrupoDto[]> {
    return this.http
      .get<ApiResponse<ParametricosGrupoDto[]>>(`${API_BASE_URL}/parametricos`)
      .pipe(map((response) => response.data));
  }

  getRoles(): Observable<Parametro[]> {
    return this.getParametrosDesdeGrupo('roles');
  }

  getEstadosTicket(_incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametrosDesdeGrupo('estadosTicket');
  }

  getOrigenesTicket(_incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametrosDesdeGrupo('origenesTicket');
  }

  getAreasTicket(_incluirInactivos = false): Observable<Parametro[]> {
    return this.getParametrosDesdeGrupo('areas');
  }

  private getParametrosDesdeGrupo(nombre: string): Observable<Parametro[]> {
    return this.getParametricos().pipe(
      map((grupos) => {
        const grupo = grupos.find((item) => item.nombre === nombre);
        return Array.isArray(grupo?.items) ? (grupo.items as Parametro[]) : [];
      }),
    );
  }
}
