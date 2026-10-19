import type { RequestHandler } from 'express';
import { SequelizePropertyRepository } from '../../../infrastructure/repositories/SequelizePropertyRepository.js';
import { ListPropertiesUseCase } from '../../../application/properties/ListPropertiesUseCase.js';
import { asyncHandler } from '../../../shared/http/asyncHandler.js';
import { buildPaginationMeta } from '../../../shared/http/pagination.js';

const repo = new SequelizePropertyRepository();
const listUseCase = new ListPropertiesUseCase(repo);

export const index: RequestHandler = asyncHandler(async (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await listUseCase.execute({
    pagination: { page, limit, offset },
    sort: {
      sortBy: q.sortBy ?? 'community',
      sortOrder: (q.sortOrder as 'asc' | 'desc') ?? 'asc',
    },
    search: q.search,
    municipalityId: q.municipalityId ? Number(q.municipalityId) : undefined,
  });

  res.status(200).json({
    data: result.data,
    meta: buildPaginationMeta(page, limit, result.total),
  });
});
