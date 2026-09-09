import type { ProjectAssignment } from '../entities/ProjectAssignment.js';

export interface ProjectAssignmentRepository {
  findByProjectId(projectId: string): Promise<ProjectAssignment[]>;
  isUserAssignedToProject(userId: string, projectId: string): Promise<boolean>;
  assignUser(projectId: string, userId: string): Promise<ProjectAssignment>;
  unassignUser(projectId: string, userId: string): Promise<boolean>;
  findAssignedProjectIds(userId: string): Promise<string[]>;
}
