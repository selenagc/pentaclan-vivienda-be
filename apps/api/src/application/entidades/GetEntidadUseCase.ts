import type { EntidadPublica } from '../../domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetEntidadUseCase {
  constructor(private readonly entidades: EntidadPublicaRepository) {}

  async execute(id: number): Promise<EntidadPublica> {
    const entidad = await this.entidades.findById(id);
    if (!entidad) throw new NotFoundError(`Entidad publica ${id} not found`);

    return entidad;
  }
}
