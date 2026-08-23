import type { EntidadPublica } from '../../domain/entities/EntidadPublica.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';

export class ListEntidadesUseCase {
  constructor(private readonly entidades: EntidadPublicaRepository) {}

  async execute(): Promise<EntidadPublica[]> {
    return this.entidades.list();
  }
}
