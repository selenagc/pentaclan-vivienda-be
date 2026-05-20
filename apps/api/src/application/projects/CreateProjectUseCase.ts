import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { ProjectStatus } from '../../domain/types/ProjectStatus.js';

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  clientId?: string | null;
}

function toDateOrNull(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export class CreateProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    return this.projects.create({
      name: dto.name,
      description: dto.description ?? null,
      status: dto.status ?? 'active',
      startDate: toDateOrNull(dto.startDate),
      endDate: toDateOrNull(dto.endDate),
      clientId: dto.clientId ?? null,
    });
  }
}
