import type { Request } from 'express';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../config/constants.js';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export function parsePagination(req: Request): PaginationParams {
  const rawPage = Number.parseInt(String(req.query.page ?? '1'), 10);
  const rawLimit = Number.parseInt(String(req.query.limit ?? DEFAULT_PAGE_LIMIT), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_PAGE_LIMIT) : DEFAULT_PAGE_LIMIT;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function parseSort(req: Request, allowedFields: string[], defaultField: string): SortParams {
  const sortByRaw = typeof req.query.sortBy === 'string' ? req.query.sortBy : defaultField;
  const sortOrderRaw = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.toLowerCase() : 'asc';

  const sortBy = allowedFields.includes(sortByRaw) ? sortByRaw : defaultField;
  const sortOrder: 'asc' | 'desc' = sortOrderRaw === 'desc' ? 'desc' : 'asc';

  return { sortBy, sortOrder };
}

export function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
