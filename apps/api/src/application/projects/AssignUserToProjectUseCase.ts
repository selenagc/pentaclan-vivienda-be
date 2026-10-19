import type { ProjectAssignment } from '../../domain/entities/ProjectAssignment.js';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { ProjectAssignmentRepository } from '../../domain/repositories/ProjectAssignmentRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

const ASSIGNABLE_ROLES = ['technical_lead', 'social_lead'];

export interface AssignUsersInput {
  projectId: string;
  userIds: string[];
}

export class AssignUserToProjectUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly userRepo: UserRepository,
    private readonly assignmentRepo: ProjectAssignmentRepository,
  ) {}

  async execute(input: AssignUsersInput): Promise<ProjectAssignment[]> {
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const results: ProjectAssignment[] = [];

    for (const userId of input.userIds) {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new NotFoundError(`User ${userId} not found`);
      }

      if (!ASSIGNABLE_ROLES.includes(user.role)) {
        throw new ValidationError(
          `Solo usuarios con rol social_lead o technical_lead pueden asignarse a proyectos (usuario ${user.name} es ${user.role}).`,
        );
      }

      const assignment = await this.assignmentRepo.assignUser(input.projectId, userId);
      results.push(assignment);
    }

    return results;
  }
}
