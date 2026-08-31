import type { Property } from '../../domain/entities/Property.js';
import type { PropertyRepository } from '../../domain/repositories/PropertyRepository.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';

export interface ListPropertiesDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  municipalityId?: number;
}

/**
 * Alimenta el buscador del formulario de registro. Sin codigo catastral, que el
 * operador encuentre y elija un inmueble ya registrado es la unica forma de que
 * dos fichas apunten a la misma vivienda fisica en vez de duplicarla.
 */
export class ListPropertiesUseCase {
  constructor(private readonly properties: PropertyRepository) {}

  async execute(dto: ListPropertiesDto): Promise<PageResult<Property>> {
    return this.properties.list(dto);
  }
}
