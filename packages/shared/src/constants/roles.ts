export const Roles = {
  ADMIN: 'admin',
  SOCIAL_LEAD: 'social_lead',
  TECHNICAL_LEAD: 'technical_lead',
  PROJECT_SUPERVISOR: 'project_supervisor',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
