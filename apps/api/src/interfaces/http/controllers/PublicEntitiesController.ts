import type { RequestHandler } from 'express';
import { SequelizePublicEntityRepository } from '../../../infrastructure/repositories/SequelizePublicEntityRepository.js';
import { ListPublicEntitiesUseCase } from '../../../application/public-entities/ListPublicEntitiesUseCase.js';
import { GetPublicEntityUseCase } from '../../../application/public-entities/GetPublicEntityUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';

const repo = new SequelizePublicEntityRepository();
const listPublicEntitiesUseCase = new ListPublicEntitiesUseCase(repo);
const getPublicEntityUseCase = new GetPublicEntityUseCase(repo);

export const listPublicEntities: RequestHandler = asyncHandler(async (_req, res) => {
  const publicEntities = await listPublicEntitiesUseCase.execute();
  res.status(200).json({ data: publicEntities });
});

export const getPublicEntity: RequestHandler = asyncHandler(async (req, res) => {
  const publicEntity = await getPublicEntityUseCase.execute(Number(req.params.id));
  res.status(200).json({ data: publicEntity });
});
