import type { Proyecto } from '../entities/Proyecto.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

export interface CreateProyectoInput {
  nombre: string;
  nroContrato: string;
  entidadPublicaId: number;
  usuarioId: string;
}

/** `usuarioId` queda fuera a proposito: el creador es inmutable (PV-21). */
export type UpdateProyectoInput = Partial<Omit<CreateProyectoInput, 'usuarioId'>>;

export interface ListProyectosQuery {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  entidadPublicaId?: number;
  usuarioId?: string;
}

export interface ProyectoRepository {
  create(input: CreateProyectoInput): Promise<Proyecto>;
  findById(id: string): Promise<Proyecto | null>;
  findByNroContrato(nroContrato: string): Promise<Proyecto | null>;
  update(id: string, input: UpdateProyectoInput): Promise<Proyecto | null>;
  list(query: ListProyectosQuery): Promise<PageResult<Proyecto>>;
}
