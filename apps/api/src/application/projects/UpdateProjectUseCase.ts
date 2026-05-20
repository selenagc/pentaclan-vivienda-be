import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository, UpdateProjectInput } from '../../domain/repositories/ProjectRepository.js';
import type { ProjectStatus } from '../../domain/types/ProjectStatus.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  clientId?: string | null;
}

function toDateOrNull(value: string | Date | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export class UpdateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(id: string, dto: UpdateProjectDto): Promise<Project> {
    const patch: UpdateProjectInput = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.clientId !== undefined) patch.clientId = dto.clientId;

    const startDate = toDateOrNull(dto.startDate);
    if (startDate !== undefined) patch.startDate = startDate;

    const endDate = toDateOrNull(dto.endDate);
    if (endDate !== undefined) patch.endDate = endDate;

    const updated = await this.projects.update(id, patch);
    if (!updated) throw new NotFoundError(`Project ${id} not found`);
    return updated;
  }
}
