import type { Proyecto } from '../../domain/entities/Proyecto.js';
import type { ProyectoRepository } from '../../domain/repositories/ProyectoRepository.js';
import type { EntidadPublicaRepository } from '../../domain/repositories/EntidadPublicaRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export interface CreateProyectoDto {
  nombre: string;
  nroContrato: string;
  entidadPublicaId: number;
  /**
   * Se toma de la sesion (req.user.id), nunca del cuerpo de la peticion.
   * El validator rechaza con 400 cualquier intento de enviarlo desde el cliente.
   */
  usuarioId: string;
}

export class CreateProyectoUseCase {
  constructor(
    private readonly proyectos: ProyectoRepository,
    private readonly entidades: EntidadPublicaRepository,
  ) {}

  async execute(dto: CreateProyectoDto): Promise<Proyecto> {
    const entidad = await this.entidades.findById(dto.entidadPublicaId);
    if (!entidad) throw new NotFoundError(`Entidad publica ${dto.entidadPublicaId} not found`);

    const existing = await this.proyectos.findByNroContrato(dto.nroContrato);
    if (existing) throw new ConflictError('Nro de contrato already in use');

    return this.proyectos.create(dto);
  }
}
