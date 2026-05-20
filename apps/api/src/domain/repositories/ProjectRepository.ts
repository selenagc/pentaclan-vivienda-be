import type { Project } from '../entities/Project.js';
import type { ProjectStatus } from '../types/ProjectStatus.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

export interface CreateProjectInput {
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  clientId: string | null;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ListProjectsQuery {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  status?: ProjectStatus;
  clientId?: string;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  delete(id: string): Promise<boolean>;
  list(query: ListProjectsQuery): Promise<PageResult<Project>>;
}
