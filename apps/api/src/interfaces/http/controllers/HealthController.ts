import type { RequestHandler } from 'express';
import { ok } from '../../../shared/http/responses.js';

export const healthCheck: RequestHandler = (_req, res) => {
  ok(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};
