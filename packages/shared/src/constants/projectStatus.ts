export const ProjectStatuses = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ProjectStatus = (typeof ProjectStatuses)[keyof typeof ProjectStatuses];

export const PROJECT_STATUS_VALUES: ProjectStatus[] = Object.values(ProjectStatuses);
