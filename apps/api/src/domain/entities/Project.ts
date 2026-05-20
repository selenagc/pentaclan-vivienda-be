import type { ProjectStatus } from '../types/ProjectStatus.js';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  clientId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
