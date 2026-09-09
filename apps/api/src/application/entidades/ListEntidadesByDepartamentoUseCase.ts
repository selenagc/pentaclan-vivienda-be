import type { EntidadPublica } from '../../domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';
import type { GeografiaRepository } from '../../domain/repositories/GeografiaRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class ListEntidadesByDepartamentoUseCase {
  constructor(
    private readonly entidades: EntidadPublicaRepository,
    private readonly geografia: GeografiaRepository,
  ) {}

  async execute(departamentoId: number): Promise<EntidadPublica[]> {
    // 404 (y no lista vacia) cuando el departamento padre no existe.
    const exists = await this.geografia.departamentoExists(departamentoId);
    if (!exists) throw new NotFoundError(`Departamento ${departamentoId} not found`);

    return this.entidades.listByDepartamento(departamentoId);
  }
}
