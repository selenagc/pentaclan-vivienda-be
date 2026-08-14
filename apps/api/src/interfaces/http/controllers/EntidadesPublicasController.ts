import type { RequestHandler } from 'express';
import { SequelizeEntidadPublicaRepository } from '../../../infrastructure/repositories/SequelizeEntidadPublicaRepository.js';
import { SequelizeGeografiaRepository } from '../../../infrastructure/repositories/SequelizeGeografiaRepository.js';
import { ListEntidadesUseCase } from '../../../application/entidades/ListEntidadesUseCase.js';
import { GetEntidadUseCase } from '../../../application/entidades/GetEntidadUseCase.js';
import { ListEntidadesByDepartamentoUseCase } from '../../../application/entidades/ListEntidadesByDepartamentoUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { ok } from '../../../shared/http/responses.js';

const repo = new SequelizeEntidadPublicaRepository();
const geografiaRepo = new SequelizeGeografiaRepository();
const listEntidadesUseCase = new ListEntidadesUseCase(repo);
const getEntidadUseCase = new GetEntidadUseCase(repo);
const listEntidadesByDepartamentoUseCase = new ListEntidadesByDepartamentoUseCase(
  repo,
  geografiaRepo,
);

export const listEntidades: RequestHandler = asyncHandler(async (_req, res) => {
  const entidades = await listEntidadesUseCase.execute();
  ok(res, entidades);
});

export const getEntidad: RequestHandler = asyncHandler(async (req, res) => {
  const entidad = await getEntidadUseCase.execute(Number(req.params.id));
  ok(res, entidad);
});

export const listEntidadesByDepartamento: RequestHandler = asyncHandler(async (req, res) => {
  const entidades = await listEntidadesByDepartamentoUseCase.execute(Number(req.params.id));
  ok(res, entidades);
});
