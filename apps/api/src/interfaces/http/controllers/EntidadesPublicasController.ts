import type { RequestHandler } from 'express';
import { SequelizeEntidadPublicaRepository } from '../../../infrastructure/repositories/SequelizeEntidadPublicaRepository.js';
import { ListEntidadesUseCase } from '../../../application/entidades/ListEntidadesUseCase.js';
import { GetEntidadUseCase } from '../../../application/entidades/GetEntidadUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';

const repo = new SequelizeEntidadPublicaRepository();
const listEntidadesUseCase = new ListEntidadesUseCase(repo);
const getEntidadUseCase = new GetEntidadUseCase(repo);

export const listEntidades: RequestHandler = asyncHandler(async (_req, res) => {
  const entidades = await listEntidadesUseCase.execute();
  res.status(200).json({ data: entidades });
});

export const getEntidad: RequestHandler = asyncHandler(async (req, res) => {
  const entidad = await getEntidadUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: entidad });
});
