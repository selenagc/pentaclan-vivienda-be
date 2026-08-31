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
   * El filtro que deja PV-31 casi resuelto: la lista de beneficiarios de un
   * proyecto es este mismo endpoint con `status=approved`.
   */
  status?: ApplicationStatus;
  municipalityId?: number;
}

export class ListApplicationsUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(dto: ListApplicationsDto): Promise<PageResult<Application>> {
    return this.applications.list(dto);
  }
}
