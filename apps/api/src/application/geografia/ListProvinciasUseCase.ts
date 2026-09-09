import type { Provincia } from '../../domain/entities/Provincia.js';
import type { GeografiaRepository } from '../../domain/repositories/GeografiaRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class ListProvinciasUseCase {
  constructor(private readonly geografia: GeografiaRepository) {}

  async execute(departamentoId: number): Promise<Provincia[]> {
    // 404 (y no lista vacia) cuando el departamento padre no existe.
    const exists = await this.geografia.departamentoExists(departamentoId);
    if (!exists) throw new NotFoundError(`Departamento ${departamentoId} not found`);

    return this.geografia.listProvinciasByDepartamento(departamentoId);
  }
}
