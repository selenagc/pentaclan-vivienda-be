import type { RequestHandler } from 'express';
import { SequelizeProjectRepository } from '../../../infrastructure/repositories/SequelizeProjectRepository.js';
import { SequelizePublicEntityRepository } from '../../../infrastructure/repositories/SequelizePublicEntityRepository.js';
import { SequelizeGeographyRepository } from '../../../infrastructure/repositories/SequelizeGeographyRepository.js';
import { CreateProjectUseCase } from '../../../application/projects/CreateProjectUseCase.js';
import { GetProjectUseCase } from '../../../application/projects/GetProjectUseCase.js';
import { ListProjectsUseCase } from '../../../application/projects/ListProjectsUseCase.js';
import { UpdateProjectUseCase } from '../../../application/projects/UpdateProjectUseCase.js';
import { ListAssignedProjectsUseCase } from '../../../application/projects/ListAssignedProjectsUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { ok } from '../../../shared/http/responses.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';

const repo = new SequelizeProjectRepository();
const publicEntitiesRepo = new SequelizePublicEntityRepository();
const geographyRepo = new SequelizeGeographyRepository();
const createUseCase = new CreateProjectUseCase(repo, publicEntitiesRepo, geographyRepo);
const getUseCase = new GetProjectUseCase(repo);
const listUseCase = new ListProjectsUseCase(repo);
const updateUseCase = new UpdateProjectUseCase(repo, publicEntitiesRepo, geographyRepo);
const listAssignedUseCase = new ListAssignedProjectsUseCase(repo);

export const index: RequestHandler = asyncHandler(async (req, res) => {
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
