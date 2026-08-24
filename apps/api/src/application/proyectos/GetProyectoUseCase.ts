import type { Proyecto } from '../../domain/entities/Proyecto.js';
import type { ProyectoRepository } from '../../domain/repositories/ProyectoRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetProyectoUseCase {
  constructor(private readonly proyectos: ProyectoRepository) {}

  async execute(id: string): Promise<Proyecto> {
    const proyecto = await this.proyectos.findById(id);
    if (!proyecto) throw new NotFoundError(`Proyecto ${id} not found`);

    return proyecto;
  }
}
