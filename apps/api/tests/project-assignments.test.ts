import request from 'supertest';
import { createApp } from '../src/app.js';
import { TokenService } from '../src/application/services/TokenService.js';
import { SequelizeProjectRepository } from '../src/infrastructure/repositories/SequelizeProjectRepository.js';
import { SequelizeUserRepository } from '../src/infrastructure/repositories/SequelizeUserRepository.js';
import { SequelizeProjectAssignmentRepository } from '../src/infrastructure/repositories/SequelizeProjectAssignmentRepository.js';
import type { Project } from '../src/domain/entities/Project.js';
import type { User } from '../src/domain/entities/User.js';
import type { ProjectAssignment } from '../src/domain/entities/ProjectAssignment.js';

describe('Project Assignments & Access Control', () => {
  const app = createApp();
  const tokenService = new TokenService();

  const adminId = '11111111-1111-4111-8111-111111111111';
  const adminToken = tokenService.signAccessToken({ sub: adminId, role: 'admin' });

  const socialId = '22222222-2222-4222-8222-222222222222';
  const socialToken = tokenService.signAccessToken({ sub: socialId, role: 'social_lead' });

  const projectId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const mockProject: Project = {
    id: projectId,
    name: 'Proyecto Demo PV-35',
    contractNo: 'CONTRATO-001',
    publicEntity: { id: 1, name: 'Entidad Demo' },
    municipality: {
      id: 1,
      name: 'Municipio Demo',
      province: { id: 1, name: 'Provincia Demo' },
      department: { id: 1, name: 'Depto Demo' },
    },
    userName: 'Admin Demo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/projects/:id/assignments', () => {
    it('rejects with 403 if user is social_lead', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/assignments`)
        .set('Authorization', `Bearer ${socialToken}`);

      expect(res.status).toBe(403);
    });

    it('returns assignments if user is admin', async () => {
      const mockAssignments: ProjectAssignment[] = [
        {
          id: 1,
          projectId,
          userId: socialId,
          active: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: socialId,
            name: 'Lic. Sofia Social',
            email: 'sofia@demo.com',
            role: 'social_lead',
          },
        },
      ];

      jest.spyOn(SequelizeProjectRepository.prototype, 'findById').mockResolvedValue(mockProject);
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'findByProjectId')
        .mockResolvedValue(mockAssignments);

      const res = await request(app)
        .get(`/api/projects/${projectId}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].user.name).toBe('Lic. Sofia Social');
    });
  });

  describe('POST /api/projects/:id/assignments', () => {
    it('rejects with 403 if called by social_lead', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/assignments`)
        .set('Authorization', `Bearer ${socialToken}`)
        .send({ userId: socialId });

      expect(res.status).toBe(403);
    });

    it('successfully assigns an evaluator when called by admin', async () => {
      const mockUser: User = {
        id: socialId,
        name: 'Lic. Sofia Social',
        email: 'sofia@demo.com',
        passwordHash: '$2b$10$demo',
        role: 'social_lead',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockAssignment: ProjectAssignment = {
        id: 1,
        projectId,
        userId: socialId,
        active: true,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: socialId,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      };

      jest.spyOn(SequelizeProjectRepository.prototype, 'findById').mockResolvedValue(mockProject);
      jest.spyOn(SequelizeUserRepository.prototype, 'findById').mockResolvedValue(mockUser);
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'assignUser')
        .mockResolvedValue(mockAssignment);

      const res = await request(app)
        .post(`/api/projects/${projectId}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: socialId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('DELETE /api/projects/:id/assignments/:userId', () => {
    it('unassigns evaluator successfully when called by admin', async () => {
      jest.spyOn(SequelizeProjectRepository.prototype, 'findById').mockResolvedValue(mockProject);
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'unassignUser')
        .mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/projects/${projectId}/assignments/${socialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Project-Level Access Restriction', () => {
    it('rejects GET /api/projects/:id with 403 when evaluator is NOT assigned', async () => {
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'isUserAssignedToProject')
        .mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${socialToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('No tienes autorización');
    });

    it('allows GET /api/projects/:id with 200 when evaluator IS assigned', async () => {
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'isUserAssignedToProject')
        .mockResolvedValue(true);
      jest.spyOn(SequelizeProjectRepository.prototype, 'findById').mockResolvedValue(mockProject);

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${socialToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(projectId);
    });

    it('rejects GET /api/applications with 403 when evaluator queries unassigned project', async () => {
      jest
        .spyOn(SequelizeProjectAssignmentRepository.prototype, 'isUserAssignedToProject')
        .mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/applications?projectId=${projectId}`)
        .set('Authorization', `Bearer ${socialToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('No estás asignado');
    });
  });
});
