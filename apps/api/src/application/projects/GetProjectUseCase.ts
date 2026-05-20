import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetProjectUseCase {
  constructor(private readonly projects: ProjectRepository) {}

  async execute(id: string): Promise<Project> {
    const project = await this.projects.findById(id);
    if (!project) throw new NotFoundError(`Project ${id} not found`);
    return project;
  }
}
