import type { Proyecto } from '../../domain/entities/Proyecto.js';
import type { ProyectoRepository } from '../../domain/repositories/ProyectoRepository.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';

export interface ListProyectosDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  entidadPublicaId?: number;
  usuarioId?: string;
}

export class ListProyectosUseCase {
  constructor(private readonly proyectos: ProyectoRepository) {}

  async execute(dto: ListProyectosDto): Promise<PageResult<Proyecto>> {
    return this.proyectos.list(dto);
  }
}
