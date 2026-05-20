import type { RequestHandler } from 'express';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import type { Role } from '../../../domain/types/Role.js';

export function authorize(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new UnauthorizedError('Not authenticated'));
    if (!allowed.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
}
