import type { Response } from 'express';
import type { PaginationMeta } from '@pentaclan/shared';

export function ok<T>(res: Response, data: T, message?: string): Response {
  return res.status(200).json({ success: true, data, ...(message ? { message } : {}) });
}

export function created<T>(res: Response, data: T, message?: string): Response {
  return res.status(201).json({ success: true, data, ...(message ? { message } : {}) });
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export function paginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message?: string,
): Response {
  return res.status(200).json({ success: true, data, meta, ...(message ? { message } : {}) });
}

export function fail(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
