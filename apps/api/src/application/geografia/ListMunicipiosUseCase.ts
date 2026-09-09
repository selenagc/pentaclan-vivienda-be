import type { Municipio } from '../../domain/entities/Municipio.js';
import type { GeografiaRepository } from '../../domain/repositories/GeografiaRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class ListMunicipiosUseCase {
  constructor(private readonly geografia: GeografiaRepository) {}

  async execute(provinciaId: number): Promise<Municipio[]> {
    const exists = await this.geografia.provinciaExists(provinciaId);
    if (!exists) throw new NotFoundError(`Provincia ${provinciaId} not found`);

    return this.geografia.listMunicipiosByProvincia(provinciaId);
  }
}
