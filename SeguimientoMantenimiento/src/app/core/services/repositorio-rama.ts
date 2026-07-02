import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { RamasModel } from '../../models/interfaces/ramas.model';
import { RamasTicketModel } from '../../models/interfaces/ramas-ticket.model';
import { Repository } from '../../models/interfaces/repository.model';
import { API_BASE_URL } from './api.config';
import { ApiResponse } from '../../models/interfaces/api-response.model';

export interface RamaTicketDetalle extends RamasTicketModel {
  idRepositorio: string;
  repositorio: string;
  rama: string;
}

interface RepositorioDto {
  idRepositorio: string;
  nombre: string;
  link?: string | null;
  descripcion?: string | null;
}

interface RamaDto {
  idRama: string;
  idRepositorio: string;
  nombre: string;
  fechaCreacion: string;
}

interface RamaTicketDto {
  idRamaTicket: string;
  idTicket: string;
  idRepositorio: string;
  repositorio: string;
  idRama: string;
  rama: string;
  fechaAsignacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class RepositorioRamaService {
  private http = inject(HttpClient);

  getRepositorios(): Observable<Repository[]> {
    return this.http
      .get<ApiResponse<RepositorioDto[]>>(`${API_BASE_URL}/repositorios`)
      .pipe(map((response) => response.data.map((repositorio) => this.mapRepositorio(repositorio))));
  }

  createRepositorio(repositorio: Omit<Repository, 'idRepositorio'>): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/repositorios`, {
        nombre: repositorio.repositorio,
        link: repositorio.link || null,
        descripcion: repositorio.descripcion || null,
      })
      .pipe(map((response) => response.data));
  }

  getRamas(idRepositorio: string): Observable<RamasModel[]> {
    return this.http
      .get<ApiResponse<RamaDto[]>>(`${API_BASE_URL}/repositorios/${idRepositorio}/ramas`)
      .pipe(map((response) => response.data.map((rama) => this.mapRama(rama))));
  }

  createRama(idRepositorio: string, nombre: string): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/repositorios/${idRepositorio}/ramas`, {
        nombre,
      })
      .pipe(map((response) => response.data));
  }

  getRamasTicket(idTicket: string): Observable<RamaTicketDetalle[]> {
    return this.http
      .get<ApiResponse<RamaTicketDto[]>>(`${API_BASE_URL}/tickets/${idTicket}/ramas`)
      .pipe(map((response) => response.data.map((ramaTicket) => this.mapRamaTicket(ramaTicket))));
  }

  asignarRamaTicket(idTicket: string, idRepositorio: string, idRama: string): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${API_BASE_URL}/tickets/${idTicket}/ramas`, {
        idRepositorio,
        idRama,
      })
      .pipe(map((response) => response.data));
  }

  desasignarRamaTicket(idTicket: string, idRama: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${API_BASE_URL}/tickets/${idTicket}/ramas/${idRama}`)
      .pipe(map((response) => response.data));
  }

  private mapRepositorio(repositorio: RepositorioDto): Repository {
    return {
      idRepositorio: repositorio.idRepositorio,
      repositorio: repositorio.nombre,
      link: repositorio.link ?? '',
      descripcion: repositorio.descripcion ?? undefined,
    };
  }

  private mapRama(rama: RamaDto): RamasModel {
    return {
      idRama: rama.idRama,
      idRepositorio: rama.idRepositorio,
      nombreRama: rama.nombre,
      fechaCreacion: new Date(rama.fechaCreacion),
    };
  }

  private mapRamaTicket(ramaTicket: RamaTicketDto): RamaTicketDetalle {
    return {
      idRamaTicket: ramaTicket.idRamaTicket,
      idTicket: ramaTicket.idTicket,
      idRepositorio: ramaTicket.idRepositorio,
      repositorio: ramaTicket.repositorio,
      idRama: ramaTicket.idRama,
      rama: ramaTicket.rama,
      fechaAsignacion: new Date(ramaTicket.fechaAsignacion),
    };
  }
}
