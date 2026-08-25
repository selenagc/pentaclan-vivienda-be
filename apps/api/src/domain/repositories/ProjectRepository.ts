import type { Project } from '../entities/Project.js';
import type { PageRequest, PageResult, SortRequest } from '../types/Pagination.js';

export interface CreateProjectInput {
  name: string;
  contractNo: string;
  publicEntityId: number;
  municipalityId: number;
  userId: string;
}

/** `userId` queda fuera a proposito: el creador es inmutable (PV-21). */
export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'userId'>>;

export interface ListProjectsQuery {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  publicEntityId?: number;
  municipalityId?: number;
  userId?: string;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByContractNo(contractNo: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  list(query: ListProjectsQuery): Promise<PageResult<Project>>;
}
