import type { RequestHandler } from 'express';
import { SequelizeProyectoRepository } from '../../../infrastructure/repositories/SequelizeProyectoRepository.js';
import { SequelizeEntidadPublicaRepository } from '../../../infrastructure/repositories/SequelizeEntidadPublicaRepository.js';
import { CreateProyectoUseCase } from '../../../application/proyectos/CreateProyectoUseCase.js';
import { GetProyectoUseCase } from '../../../application/proyectos/GetProyectoUseCase.js';
import { ListProyectosUseCase } from '../../../application/proyectos/ListProyectosUseCase.js';
import { UpdateProyectoUseCase } from '../../../application/proyectos/UpdateProyectoUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';

const repo = new SequelizeProyectoRepository();
const entidadesRepo = new SequelizeEntidadPublicaRepository();
const createUseCase = new CreateProyectoUseCase(repo, entidadesRepo);
const getUseCase = new GetProyectoUseCase(repo);
const listUseCase = new ListProyectosUseCase(repo);
const updateUseCase = new UpdateProyectoUseCase(repo, entidadesRepo);

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
    entidadPublicaId: q.entidadPublicaId ? Number(q.entidadPublicaId) : undefined,
    usuarioId: q.usuarioId,
  });

  res.status(200).json({
    data: result.data,
    meta: buildPaginationMeta(page, limit, result.total),
  });
});

export const store: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) throw new UnauthorizedError();

  // El creador sale del token, no del body: el validator ya rechaza usuarioId.
  const proyecto = await createUseCase.execute({ ...req.body, usuarioId: req.user.id });
  res.status(201).json({ data: proyecto, message: 'Proyecto created' });
});

export const show: RequestHandler = asyncHandler(async (req, res) => {
  const proyecto = await getUseCase.execute(req.params.id);
  res.status(200).json({ data: proyecto });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  const proyecto = await updateUseCase.execute(req.params.id, req.body);
  res.status(200).json({ data: proyecto, message: 'Proyecto updated' });
});
