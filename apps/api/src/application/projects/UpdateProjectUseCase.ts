import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { PublicEntityRepository } from '../../domain/repositories/PublicEntityRepository.js';
import type { GeographyRepository } from '../../domain/repositories/GeographyRepository.js';
import { ConflictError } from '../../shared/errors/ConflictError.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

/** `userId` no aparece: el creador es dato de auditoria y no se edita. */
export interface UpdateProjectDto {
  name?: string;
  contractNo?: string;
  publicEntityId?: number;
  municipalityId?: number;
}

export class UpdateProjectUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly publicEntities: PublicEntityRepository,
    private readonly geography: GeographyRepository,
  ) {}

  async execute(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new NotFoundError(`Project ${id} not found`);

    if (dto.publicEntityId !== undefined) {
      const publicEntity = await this.publicEntities.findById(dto.publicEntityId);
      if (!publicEntity) throw new NotFoundError(`Public entity ${dto.publicEntityId} not found`);
    }

    if (dto.municipalityId !== undefined) {
      const municipalityFound = await this.geography.municipalityExists(dto.municipalityId);
      if (!municipalityFound) throw new NotFoundError(`Municipality ${dto.municipalityId} not found`);
    }

    // Solo es conflicto si el contrato pertenece a OTRO proyecto: reenviar el
    // propio numero en un PUT es legitimo.
    if (dto.contractNo !== undefined && dto.contractNo !== project.contractNo) {
      const existing = await this.projects.findByContractNo(dto.contractNo);
      if (existing) throw new ConflictError('Contract number already in use');
    }

    const updated = await this.projects.update(id, dto);
    if (!updated) throw new NotFoundError(`Project ${id} not found`);

    return updated;
  }
}
