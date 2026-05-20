import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class DeleteProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.projects.delete(id);
    if (!deleted) throw new NotFoundError(`Project ${id} not found`);
  }
}
