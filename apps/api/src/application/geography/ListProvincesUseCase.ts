import type { Province } from '../../domain/entities/Province.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class ListProvincesUseCase {
  constructor(private readonly geography: GeographyRepository) {}

  async execute(departmentId: number): Promise<Province[]> {
    // 404 (y no lista vacia) cuando el departamento padre no existe.
    const exists = await this.geography.departmentExists(departmentId);
    if (!exists) throw new NotFoundError(`Department ${departmentId} not found`);

    return this.geography.listProvincesByDepartment(departmentId);
  }
}
