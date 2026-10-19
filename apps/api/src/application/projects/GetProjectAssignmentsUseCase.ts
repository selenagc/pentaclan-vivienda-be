import type { ProjectAssignment } from '../../domain/entities/ProjectAssignment.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { ProjectAssignmentRepository } from '../../domain/repositories/ProjectAssignmentRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

export class GetProjectAssignmentsUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly assignmentRepo: ProjectAssignmentRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectAssignment[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return this.assignmentRepo.findByProjectId(projectId);
  }
}
