import type { Project } from '../../domain/entities/Project.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';

export class ListAssignedProjectsUseCase {
  constructor(private readonly projectRepo: ProjectRepository) {}

  async execute(userId: string): Promise<Project[]> {
    return this.projectRepo.findAssignedToUser(userId);
  }
}
