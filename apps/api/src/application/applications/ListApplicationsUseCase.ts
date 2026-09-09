import type { Application } from '../../domain/entities/Application.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { ApplicationStatus } from '../../domain/types/ApplicationStatus.js';
import type { PageRequest, PageResult, SortRequest } from '../../domain/types/Pagination.js';

export interface ListApplicationsDto {
  pagination: PageRequest;
  sort: SortRequest;
  search?: string;
  projectId?: string;
  /**
   * Estados admitidos, en OR. Es lo que sostiene las dos pestanas del padron
   * sin dos endpoints: los beneficiarios son `['approved']` y los solicitantes
   * son el resto de estados.
   */
  statuses?: ApplicationStatus[];
  municipalityId?: number;
}

export class ListApplicationsUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(dto: ListApplicationsDto): Promise<PageResult<Application>> {
    return this.applications.list(dto);
  }
}
