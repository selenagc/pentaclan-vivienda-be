export interface ProjectAssignment {
  id: number;
  userId: string;
  projectId: string;
  assignedAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
