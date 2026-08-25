import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';

export interface ListProjectsDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  publicEntityId?: number;
  municipalityId?: number;
  userId?: string;
}

export class ListProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(dto: ListProjectsDto): Promise<PageResult<Project>> {
    return this.projects.list(dto);
  }
}
