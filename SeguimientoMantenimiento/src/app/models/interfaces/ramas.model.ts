import { Repository } from './repository.model';

export interface RamasModel {
  idRama: string;
  idRepositorio: Repository;
  nombreRama: string;
  fechaCreacion: Date;
}
