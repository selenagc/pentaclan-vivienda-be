import type { RequestHandler } from 'express';
import { SequelizeApplicationRepository } from '../../../infrastructure/repositories/SequelizeApplicationRepository.js';
import { SequelizePropertyRepository } from '../../../infrastructure/repositories/SequelizePropertyRepository.js';
import { SequelizeProjectRepository } from '../../../infrastructure/repositories/SequelizeProjectRepository.js';
import { SequelizeGeographyRepository } from '../../../infrastructure/repositories/SequelizeGeographyRepository.js';
import { RegisterApplicationUseCase } from '../../../application/applications/RegisterApplicationUseCase.js';
import { GetApplicationUseCase } from '../../../application/applications/GetApplicationUseCase.js';
import { ListApplicationsUseCase } from '../../../application/applications/ListApplicationsUseCase.js';
import { UpdateApplicationUseCase } from '../../../application/applications/UpdateApplicationUseCase.js';
import { DeleteApplicationUseCase } from '../../../application/applications/DeleteApplicationUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import type { ApplicationStatus } from '../../../domain/types/ApplicationStatus.js';

const repo = new SequelizeApplicationRepository();
const propertiesRepo = new SequelizePropertyRepository();
const projectsRepo = new SequelizeProjectRepository();
const geographyRepo = new SequelizeGeographyRepository();

const registerUseCase = new RegisterApplicationUseCase(
  repo,
  projectsRepo,
  propertiesRepo,
  geographyRepo,
);
const getUseCase = new GetApplicationUseCase(repo);
const listUseCase = new ListApplicationsUseCase(repo);
const updateUseCase = new UpdateApplicationUseCase(
  repo,
  projectsRepo,
  propertiesRepo,
  geographyRepo,
);
const deleteUseCase = new DeleteApplicationUseCase(repo);

export const index: RequestHandler = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await listUseCase.execute({
    pagination: { page, limit, offset },
    sort: {
      sortBy: q.sortBy ?? 'submittedAt',
      sortOrder: (q.sortOrder as 'asc' | 'desc') ?? 'desc',
    },
    search: q.search,
    projectId: q.projectId,
    status: q.status as ApplicationStatus | undefined,
    municipalityId: q.municipalityId ? Number(q.municipalityId) : undefined,
  });

  res.status(200).json({
    data: result.data,
    meta: buildPaginationMeta(page, limit, result.total),
  });
});

export const store: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  // Quien registra sale del token, no del body: el validator ya rechaza userId.
  const application = await registerUseCase.execute({ ...req.body, userId: req.user.id });
  res.status(201).json({ data: application, message: 'Application created' });
});

export const show: RequestHandler = asyncHandler(async (req, res) => {
  const application = await getUseCase.execute(req.params.id);
  res.status(200).json({ data: application });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  const application = await updateUseCase.execute(req.params.id, req.body);
  res.status(200).json({ data: application, message: 'Application updated' });
});

export const destroy: RequestHandler = asyncHandler(async (req, res) => {
  await deleteUseCase.execute(req.params.id);
  res.status(204).send();
});
