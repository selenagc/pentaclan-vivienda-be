import type { Application } from '../../domain/entities/Application.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetApplicationUseCase {
  constructor(private readonly applications: ApplicationRepository) {}

  async execute(id: string): Promise<Application> {
    const application = await this.applications.findById(id);
    if (!application) throw new NotFoundError(`Application ${id} not found`);

    return application;
  }
}
