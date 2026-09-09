import request from 'supertest';
import { createApp } from '../src/app.js';
import { TokenService } from '../src/application/services/TokenService.js';
import { SequelizeProjectRepository } from '../src/infrastructure/repositories/SequelizeProjectRepository.js';
import type { Project } from '../src/domain/entities/Project.js';

describe('GET /api/me/projects (PV-35)', () => {
  const app = createApp();
  const tokenService = new TokenService();
  const userId = '33333333-3333-4333-8333-333333333333';
  const token = tokenService.signAccessToken({ sub: userId, role: 'social_lead' });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects with 401 when no authorization header is sent', async () => {
    const res = await request(app).get('/api/me/projects');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('returns empty array [] when user has no assigned projects', async () => {
    jest.spyOn(SequelizeProjectRepository.prototype, 'findAssignedToUser').mockResolvedValue([]);

    const res = await request(app).get('/api/me/projects').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: [],
    });
  });

  it('returns the list of projects when user has assigned projects', async () => {
    const mockProjects: Project[] = [
      {
        id: 'p-1',
        name: 'Construccion de viviendas sociales - Fase I',
        contractNo: 'AEV-2026-0042',
        publicEntity: { id: 1, name: 'Agencia Estatal de Vivienda' },
        municipality: {
          id: 100,
          name: 'El Alto',
          province: { id: 10, name: 'Murillo' },
          department: { id: 1, name: 'La Paz' },
        },
        userName: 'Admin Pentaclan',
        createdAt: new Date('2026-08-30T00:00:00.000Z'),
        updatedAt: new Date('2026-08-30T00:00:00.000Z'),
      },
    ];

    const findSpy = jest
      .spyOn(SequelizeProjectRepository.prototype, 'findAssignedToUser')
      .mockResolvedValue(mockProjects);

    const res = await request(app).get('/api/me/projects').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(findSpy).toHaveBeenCalledWith(userId);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('p-1');
    expect(res.body.data[0].name).toBe('Construccion de viviendas sociales - Fase I');
    expect(res.body.data[0].municipality.name).toBe('El Alto');
    expect(res.body.data[0].municipality.department.name).toBe('La Paz');
  });

  it('is also accessible via /me/projects without /api prefix', async () => {
    jest.spyOn(SequelizeProjectRepository.prototype, 'findAssignedToUser').mockResolvedValue([]);

    const res = await request(app).get('/me/projects').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: [],
    });
  });
});
