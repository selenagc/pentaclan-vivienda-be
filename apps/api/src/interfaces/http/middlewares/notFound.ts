import type { RequestHandler } from 'express';
import { fail } from '../../../shared/http/responses.js';

export const notFound: RequestHandler = (req, res) => {
  fail(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
};
