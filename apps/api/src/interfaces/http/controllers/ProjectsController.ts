import type { RequestHandler } from 'express';
import { SequelizeProjectRepository } from '../../../infrastructure/repositories/SequelizeProjectRepository.js';
import { SequelizePublicEntityRepository } from '../../../infrastructure/repositories/SequelizePublicEntityRepository.js';
import { SequelizeGeographyRepository } from '../../../infrastructure/repositories/SequelizeGeographyRepository.js';
import { SequelizeUserRepository } from '../../../infrastructure/repositories/SequelizeUserRepository.js';
import { SequelizeProjectAssignmentRepository } from '../../../infrastructure/repositories/SequelizeProjectAssignmentRepository.js';
import { CreateProjectUseCase } from '../../../application/projects/CreateProjectUseCase.js';
import { GetProjectUseCase } from '../../../application/projects/GetProjectUseCase.js';
import { ListProjectsUseCase } from '../../../application/projects/ListProjectsUseCase.js';
import { UpdateProjectUseCase } from '../../../application/projects/UpdateProjectUseCase.js';
import { ListAssignedProjectsUseCase } from '../../../application/projects/ListAssignedProjectsUseCase.js';
import { GetProjectAssignmentsUseCase } from '../../../application/projects/GetProjectAssignmentsUseCase.js';
import { AssignUserToProjectUseCase } from '../../../application/projects/AssignUserToProjectUseCase.js';
import { UnassignUserFromProjectUseCase } from '../../../application/projects/UnassignUserFromProjectUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { ok } from '../../../shared/http/responses.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError.js';

const repo = new SequelizeProjectRepository();
const publicEntitiesRepo = new SequelizePublicEntityRepository();
const geographyRepo = new SequelizeGeographyRepository();
const userRepo = new SequelizeUserRepository();
const assignmentRepo = new SequelizeProjectAssignmentRepository();

const createUseCase = new CreateProjectUseCase(repo, publicEntitiesRepo, geographyRepo);
const getUseCase = new GetProjectUseCase(repo);
const listUseCase = new ListProjectsUseCase(repo);
const updateUseCase = new UpdateProjectUseCase(repo, publicEntitiesRepo, geographyRepo);
const listAssignedUseCase = new ListAssignedProjectsUseCase(repo);
const getAssignmentsUseCase = new GetProjectAssignmentsUseCase(repo, assignmentRepo);
const assignUsersUseCase = new AssignUserToProjectUseCase(repo, userRepo, assignmentRepo);
const unassignUserUseCase = new UnassignUserFromProjectUseCase(repo, assignmentRepo);

export const index: RequestHandler = asyncHandler(async (req, res) => {
  // Si el usuario es evaluador técnico o social, únicamente puede consultar sus proyectos asignados
  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const projects = await listAssignedUseCase.execute(req.user.id);
    res.status(200).json({
      data: projects,
      meta: buildPaginationMeta(1, projects.length, projects.length),
    });
    return;
  }

  const q = req.query as Record<string, string | undefined>;
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await listUseCase.execute({
    pagination: { page, limit, offset },
    sort: {
      sortBy: q.sortBy ?? 'createdAt',
      sortOrder: (q.sortOrder as 'asc' | 'desc') ?? 'desc',
    },
    search: q.search,
    publicEntityId: q.publicEntityId ? Number(q.publicEntityId) : undefined,
    municipalityId: q.municipalityId ? Number(q.municipalityId) : undefined,
    userId: q.userId,
  });

  res.status(200).json({
    data: result.data,
    meta: buildPaginationMeta(page, limit, result.total),
  });
});

export const store: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  // El creador sale del token, no del body: el validator ya rechaza userId.
  const project = await createUseCase.execute({ ...req.body, userId: req.user.id });
  res.status(201).json({ data: project, message: 'Project created' });
});

export const show: RequestHandler = asyncHandler(async (req, res) => {
  // Evaluador solo puede ver proyectos a los que está formalmente asignado
  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(req.user.id, req.params.id);
    if (!isAssigned) {
      throw new ForbiddenError('No tienes autorización para acceder a este proyecto.');
    }
  }

  const project = await getUseCase.execute(req.params.id);
  res.status(200).json({ data: project });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  const project = await updateUseCase.execute(req.params.id, req.body);
  res.status(200).json({ data: project, message: 'Project updated' });
});

export const listMyProjects: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const projects = await listAssignedUseCase.execute(req.user.id);
  ok(res, projects);
});

export const getAssignments: RequestHandler = asyncHandler(async (req, res) => {
  const assignments = await getAssignmentsUseCase.execute(req.params.id);
  ok(res, assignments);
});

export const assignUsers: RequestHandler = asyncHandler(async (req, res) => {
  const userIds: string[] = req.body.userIds || [req.body.userId];
  const assignments = await assignUsersUseCase.execute({
    projectId: req.params.id,
    userIds,
  });
  res.status(201).json({
    success: true,
    data: assignments,
    message: 'Evaluadores asignados exitosamente',
  });
});

export const unassignUser: RequestHandler = asyncHandler(async (req, res) => {
  await unassignUserUseCase.execute(req.params.id, req.params.userId);
  res.status(200).json({
    success: true,
    message: 'Asignación removida exitosamente',
  });
});

