export interface ProjectAssignmentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ProjectAssignment {
  id: number;
  userId: string;
  projectId: string;
  assignedAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: ProjectAssignmentUser;
}
