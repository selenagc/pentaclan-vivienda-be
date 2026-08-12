import type { Departamento } from '../../domain/entities/Departamento.js';
import type { GeografiaRepository } from '../../domain/repositories/GeografiaRepository.js';

export class ListDepartamentosUseCase {
  constructor(private readonly geografia: GeografiaRepository) {}

  async execute(): Promise<Departamento[]> {
    return this.geografia.listDepartamentos();
  }
}
