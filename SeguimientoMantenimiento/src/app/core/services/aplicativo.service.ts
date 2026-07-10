import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';
import {
  Aplicativo,
  AplicativoTicket,
  CrearAplicativoRequest,
} from '../../models/interfaces/aplicativo.model';

interface AplicativoTicketDto {
  idAplicativoTicket: string;
  idTicket: string;
  idAplicativo: string;
  aplicativo: string;
  fechaAsignacion: string;
}

@Injectable({ providedIn: 'root' })
export class AplicativoService {
  private http = inject(HttpClient);

  getAplicativos(incluirInactivos = false): Observable<Aplicativo[]> {
    return this.http
      .get<ApiResponse<Aplicativo[]>>(`${API_BASE_URL}/aplicativos`, {
        params: { incluirInactivos },
      })
      .pipe(map((response) => response.data));
  }

  createAplicativo(request: CrearAplicativoRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/aplicativos`, request)
      .pipe(map((response) => response.data));
  }

  getAplicativosTicket(idTicket: string): Observable<AplicativoTicket[]> {
    return this.http
      .get<ApiResponse<AplicativoTicketDto[]>>(`${API_BASE_URL}/tickets/${idTicket}/aplicativos`)
      .pipe(
        map((response) =>
          response.data.map((item) => ({
            ...item,
            fechaAsignacion: new Date(item.fechaAsignacion),
          })),
        ),
      );
  }

  asignarAplicativoTicket(idTicket: string, idAplicativo: string): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/tickets/${idTicket}/aplicativos`, {
        idAplicativo,
      })
      .pipe(map((response) => response.data));
  }

  desasignarAplicativoTicket(idTicket: string, idAplicativo: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${API_BASE_URL}/tickets/${idTicket}/aplicativos/${idAplicativo}`)
      .pipe(map((response) => response.data));
  }
}
