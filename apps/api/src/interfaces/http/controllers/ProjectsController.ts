import type { RequestHandler } from 'express';
import { SequelizeProjectRepository } from '../../../infrastructure/repositories/SequelizeProjectRepository.js';
import { CreateProjectUseCase } from '../../../application/projects/CreateProjectUseCase.js';
import { GetProjectUseCase } from '../../../application/projects/GetProjectUseCase.js';
import { UpdateProjectUseCase } from '../../../application/projects/UpdateProjectUseCase.js';
import { DeleteProjectUseCase } from '../../../application/projects/DeleteProjectUseCase.js';
import { ListProjectsUseCase } from '../../../application/projects/ListProjectsUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { created, noContent, ok, paginated } from '../../../shared/http/responses.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import type { ProjectStatus } from '../../../domain/types/ProjectStatus.js';

const repo = new SequelizeProjectRepository();
const createUseCase = new CreateProjectUseCase(repo);
const getUseCase = new GetProjectUseCase(repo);
const updateUseCase = new UpdateProjectUseCase(repo);
const deleteUseCase = new DeleteProjectUseCase(repo);
const listUseCase = new ListProjectsUseCase(repo);

export const createProject: RequestHandler = asyncHandler(async (req, res) => {
  const project = await createUseCase.execute(req.body);
  created(res, project, 'Project created');
});

export const getProject: RequestHandler = asyncHandler(async (req, res) => {
  const project = await getUseCase.execute(req.params.id);
  ok(res, project);
});

export const updateProject: RequestHandler = asyncHandler(async (req, res) => {
  const project = await updateUseCase.execute(req.params.id, req.body);
  ok(res, project, 'Project updated');
});

export const deleteProject: RequestHandler = asyncHandler(async (req, res) => {
  await deleteUseCase.execute(req.params.id);
  noContent(res);
});

export const listProjects: RequestHandler = asyncHandler(async (req, res) => {
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
    status: q.status as ProjectStatus | undefined,
    clientId: q.clientId,
  });

  paginated(res, result.data, buildPaginationMeta(page, limit, result.total));
});
