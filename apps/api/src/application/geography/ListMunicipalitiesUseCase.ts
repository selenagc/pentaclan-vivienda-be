import type { Municipality } from '../../domain/entities/Municipality.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class ListMunicipalitiesUseCase {
  constructor(private readonly geography: GeographyRepository) {}

  async execute(provinceId: number): Promise<Municipality[]> {
    const exists = await this.geography.provinceExists(provinceId);
    if (!exists) throw new NotFoundError(`Province ${provinceId} not found`);

    return this.geography.listMunicipalitiesByProvince(provinceId);
  }
}
