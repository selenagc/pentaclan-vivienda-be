import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { PublicEntityRepository } from '../../domain/repositories/PublicEntityRepository.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export interface CreateProjectDto {
  name: string;
  contractNo: string;
  publicEntityId: number;
  /** Municipio donde se ejecuta el proyecto. */
  municipalityId: number;
  /**
   * Se toma de la sesion (req.user.id), nunca del cuerpo de la peticion.
   * El validator rechaza con 400 cualquier intento de enviarlo desde el cliente.
   */
  userId: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly publicEntities: PublicEntityRepository,
    private readonly geography: GeographyRepository,
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    const publicEntity = await this.publicEntities.findById(dto.publicEntityId);
    if (!publicEntity) throw new NotFoundError(`Public entity ${dto.publicEntityId} not found`);

    const municipalityFound = await this.geography.municipalityExists(dto.municipalityId);
    if (!municipalityFound) throw new NotFoundError(`Municipality ${dto.municipalityId} not found`);

    const existing = await this.projects.findByContractNo(dto.contractNo);
    if (existing) throw new ConflictError('Contract number already in use');

    return this.projects.create(dto);
  }
}
