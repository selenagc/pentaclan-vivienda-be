import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { ProjectStatus } from '../../domain/types/ProjectStatus.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';

export interface ListProjectsDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
}

export class ListProjectsUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(dto: ListProjectsDto): Promise<PageResult<Project>> {
    return this.projects.list(dto);
  }
}
