import type { RequestHandler } from 'express';
import { SequelizeApplicationRepository } from '../../../infrastructure/repositories/SequelizeApplicationRepository.js';
import { SequelizePropertyRepository } from '../../../infrastructure/repositories/SequelizePropertyRepository.js';
import { SequelizeProjectRepository } from '../../../infrastructure/repositories/SequelizeProjectRepository.js';
import { SequelizeGeographyRepository } from '../../../infrastructure/repositories/SequelizeGeographyRepository.js';
import { SequelizeProjectAssignmentRepository } from '../../../infrastructure/repositories/SequelizeProjectAssignmentRepository.js';
import { RegisterApplicationUseCase } from '../../../application/applications/RegisterApplicationUseCase.js';
import { GetApplicationUseCase } from '../../../application/applications/GetApplicationUseCase.js';
import { ListApplicationsUseCase } from '../../../application/applications/ListApplicationsUseCase.js';
import { UpdateApplicationUseCase } from '../../../application/applications/UpdateApplicationUseCase.js';
import { DeleteApplicationUseCase } from '../../../application/applications/DeleteApplicationUseCase.js';
import { DecideApplicationUseCase } from '../../../application/applications/DecideApplicationUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError.js';
import type { ApplicationStatus } from '../../../domain/types/ApplicationStatus.js';

const repo = new SequelizeApplicationRepository();
const propertiesRepo = new SequelizePropertyRepository();
const projectsRepo = new SequelizeProjectRepository();
const geographyRepo = new SequelizeGeographyRepository();
const assignmentRepo = new SequelizeProjectAssignmentRepository();

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
const decideUseCase = new DecideApplicationUseCase(repo);

export const index: RequestHandler = asyncHandler(async (req, res) => {
  // El validator ya normalizo `status` a un array de estados validos, venga
  // como valor suelto, como lista separada por comas o repitiendo el parametro.
  const q = req.query as Record<string, string | undefined> & {
    status?: ApplicationStatus[];
  };

  // Si el usuario es evaluador (social_lead o technical_lead), debe consultar dentro de un proyecto asignado
  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    if (!q.projectId) {
      throw new ForbiddenError(
        'Debes consultar las postulaciones dentro del contexto de un proyecto asignado.',
      );
    }
    const isAssigned = await assignmentRepo.isUserAssignedToProject(req.user.id, q.projectId);
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado a este proyecto.');
    }
  }

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
    statuses: q.status,
    municipalityId: q.municipalityId ? Number(q.municipalityId) : undefined,
  });

  res.status(200).json({
    data: result.data,
    meta: buildPaginationMeta(page, limit, result.total),
  });
});

export const store: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  if (req.user.role === 'social_lead' || req.user.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(req.user.id, req.body.projectId);
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado a este proyecto para registrar postulaciones.');
    }
  }

  // Quien registra sale del token, no del body: el validator ya rechaza userId.
  const application = await registerUseCase.execute({ ...req.body, userId: req.user.id });
  res.status(201).json({ data: application, message: 'Application created' });
});

export const show: RequestHandler = asyncHandler(async (req, res) => {
  const application = await getUseCase.execute(req.params.id);

  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const isAssigned = await assignmentRepo.isUserAssignedToProject(req.user.id, application.project.id);
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  res.status(200).json({ data: application });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  if (req.user?.role === 'social_lead' || req.user?.role === 'technical_lead') {
    const currentApp = await getUseCase.execute(req.params.id);
    const isAssigned = await assignmentRepo.isUserAssignedToProject(req.user.id, currentApp.project.id);
    if (!isAssigned) {
      throw new ForbiddenError('No estás asignado al proyecto de esta postulación.');
    }
  }

  const application = await updateUseCase.execute(req.params.id, req.body);
  res.status(200).json({ data: application, message: 'Application updated' });
});


export const destroy: RequestHandler = asyncHandler(async (req, res) => {
  await deleteUseCase.execute(req.params.id);
  res.status(204).send();
});

/**
 * Aprobar y rechazar son dos rutas y no un `PUT status`: son transiciones con
 * reglas propias, no la edicion de un campo. Quien decide sale del token, como
 * quien registra; el validator ya rechaza `decidedBy` desde el cliente.
 */
export const approve: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const application = await decideUseCase.execute(req.params.id, {
    decision: 'approved',
    decidedBy: req.user.id,
  });
  res.status(200).json({ data: application, message: 'Application approved' });
});

export const reject: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  const application = await decideUseCase.execute(req.params.id, {
    decision: 'rejected',
    decidedBy: req.user.id,
    rejectionReason: req.body.rejectionReason,
  });
  res.status(200).json({ data: application, message: 'Application rejected' });
});
