import type { Proyecto } from '../../domain/entities/Proyecto.js';
import type { ProyectoRepository } from '../../domain/repositories/ProyectoRepository.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

/** `usuarioId` no aparece: el creador es dato de auditoria y no se edita. */
export interface UpdateProyectoDto {
  nombre?: string;
  nroContrato?: string;
  entidadPublicaId?: number;
}

export class UpdateProyectoUseCase {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly entidades: EntidadPublicaRepository,
  ) {}

  async execute(id: string, dto: UpdateProyectoDto): Promise<Proyecto> {
    const proyecto = await this.proyectos.findById(id);
    if (!proyecto) throw new NotFoundError(`Proyecto ${id} not found`);

    if (dto.entidadPublicaId !== undefined) {
      const entidad = await this.entidades.findById(dto.entidadPublicaId);
      if (!entidad) throw new NotFoundError(`Entidad publica ${dto.entidadPublicaId} not found`);
    }

    // Solo es conflicto si el contrato pertenece a OTRO proyecto: reenviar el
    // propio numero en un PUT es legitimo.
    if (dto.nroContrato !== undefined && dto.nroContrato !== proyecto.nroContrato) {
      const existing = await this.proyectos.findByNroContrato(dto.nroContrato);
      if (existing) throw new ConflictError('Nro de contrato already in use');
    }

    const updated = await this.proyectos.update(id, dto);
    if (!updated) throw new NotFoundError(`Proyecto ${id} not found`);

    return updated;
  }
}
