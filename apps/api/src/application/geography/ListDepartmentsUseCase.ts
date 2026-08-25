import type { Department } from '../../domain/entities/Department.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';

export class ListDepartmentsUseCase {
  constructor(private readonly geography: GeographyRepository) {}

  async execute(): Promise<Department[]> {
    return this.geography.listDepartments();
  }
}
