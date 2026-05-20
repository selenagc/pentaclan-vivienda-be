import type { RequestHandler } from 'express';
import { TokenService } from '../../../application/services/TokenService.js';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError.js';
import type { Role } from '../../../domain/types/Role.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: Role;
    };
  }
}

const tokenService = new TokenService();

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};
