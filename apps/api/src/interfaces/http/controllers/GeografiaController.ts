import type { RequestHandler } from 'express';
import { SequelizeGeografiaRepository } from '../../../infrastructure/repositories/SequelizeGeografiaRepository.js';
import { ListDepartamentosUseCase } from '../../../application/geografia/ListDepartamentosUseCase.js';
import { ListProvinciasUseCase } from '../../../application/geografia/ListProvinciasUseCase.js';
import { ListMunicipiosUseCase } from '../../../application/geografia/ListMunicipiosUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';

const repo = new SequelizeGeografiaRepository();
const listDepartamentosUseCase = new ListDepartamentosUseCase(repo);
const listProvinciasUseCase = new ListProvinciasUseCase(repo);
const listMunicipiosUseCase = new ListMunicipiosUseCase(repo);

export const listDepartamentos: RequestHandler = asyncHandler(async (_req, res) => {
  const departamentos = await listDepartamentosUseCase.execute();
  res.status(200).json({ data: departamentos });
});

export const listProvinciasByDepartamento: RequestHandler = asyncHandler(async (req, res) => {
  const provincias = await listProvinciasUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: provincias });
});

export const listMunicipiosByProvincia: RequestHandler = asyncHandler(async (req, res) => {
  const municipios = await listMunicipiosUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: municipios });
});
