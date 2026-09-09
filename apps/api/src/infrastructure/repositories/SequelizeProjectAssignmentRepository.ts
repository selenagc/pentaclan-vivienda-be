import { ProjectAssignmentModel } from '../database/models/ProjectAssignmentModel.js';
import type { ProjectAssignment } from '../../domain/entities/ProjectAssignment.js';
import type { ProjectAssignmentRepository } from '../../domain/repositories/ProjectAssignmentRepository.js';

function toEntity(model: ProjectAssignmentModel): ProjectAssignment {
  return {
    id: model.id,
    userId: model.userId,
    projectId: model.projectId,
    assignedAt: model.assignedAt,
    active: model.active,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    user: model.user
      ? {
          id: model.user.id,
          name: model.user.name,
          email: model.user.email,
          role: model.user.role,
        }
      : undefined,
  };
}

const INCLUDE_USER = [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }];

export class SequelizeProjectAssignmentRepository implements ProjectAssignmentRepository {
  async findByProjectId(projectId: string): Promise<ProjectAssignment[]> {
    const rows = await ProjectAssignmentModel.findAll({
      where: { projectId, active: true },
      include: INCLUDE_USER,
      order: [['assigned_at', 'ASC']],
    });
    return rows.map(toEntity);
  }

  async isUserAssignedToProject(userId: string, projectId: string): Promise<boolean> {
    const count = await ProjectAssignmentModel.count({
      where: { userId, projectId, active: true },
    });
    return count > 0;
  }

  async assignUser(projectId: string, userId: string): Promise<ProjectAssignment> {
    const existing = await ProjectAssignmentModel.findOne({
      where: { projectId, userId },
    });

    let assignment: ProjectAssignmentModel;
    if (existing) {
      existing.active = true;
      existing.assignedAt = new Date();
      await existing.save();
      assignment = existing;
    } else {
      assignment = await ProjectAssignmentModel.create({
        projectId,
        userId,
        active: true,
        assignedAt: new Date(),
      });
    }

    await assignment.reload({
      include: INCLUDE_USER,
    });
    return toEntity(assignment);
  }

  async unassignUser(projectId: string, userId: string): Promise<boolean> {
    const existing = await ProjectAssignmentModel.findOne({
      where: { projectId, userId, active: true },
    });
    if (!existing) return false;
    existing.active = false;
    await existing.save();
    return true;
  }

  async findAssignedProjectIds(userId: string): Promise<string[]> {
    const rows = await ProjectAssignmentModel.findAll({
      where: { userId, active: true },
      attributes: ['projectId'],
    });
    return rows.map((r) => r.projectId);
  }
}
