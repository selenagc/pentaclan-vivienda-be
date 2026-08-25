import type { RequestHandler } from 'express';
import { SequelizeGeographyRepository } from '../../../infrastructure/repositories/SequelizeGeographyRepository.js';
import { ListDepartmentsUseCase } from '../../../application/geography/ListDepartmentsUseCase.js';
import { ListProvincesUseCase } from '../../../application/geography/ListProvincesUseCase.js';
import { ListMunicipalitiesUseCase } from '../../../application/geography/ListMunicipalitiesUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';

const repo = new SequelizeGeographyRepository();
const listDepartmentsUseCase = new ListDepartmentsUseCase(repo);
const listProvincesUseCase = new ListProvincesUseCase(repo);
const listMunicipalitiesUseCase = new ListMunicipalitiesUseCase(repo);

export const listDepartments: RequestHandler = asyncHandler(async (_req, res) => {
  const departments = await listDepartmentsUseCase.execute();
  res.status(200).json({ data: departments });
});

export const listProvincesByDepartment: RequestHandler = asyncHandler(async (req, res) => {
  const provinces = await listProvincesUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: provinces });
});

export const listMunicipalitiesByProvince: RequestHandler = asyncHandler(async (req, res) => {
  const municipalities = await listMunicipalitiesUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: municipalities });
});
