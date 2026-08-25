import type { NextFunction, Request, Response } from 'express';
import { authorize } from '../../src/interfaces/http/middlewares/authorize.js';
import { ForbiddenError } from '../../src/shared/errors/ForbiddenError.js';
import { UnauthorizedError } from '../../src/shared/errors/UnauthorizedError.js';
import type { Role } from '../../src/domain/types/Role.js';

// authenticate() ya dejo el usuario en la request; aqui solo importa su rol.
function requestConRol(role?: Role): Request {
  return (role ? { user: { id: 'u-1', role } } : {}) as Request;
}

function ejecutar(middleware: ReturnType<typeof authorize>, req: Request): unknown {
  let recibido: unknown = 'no-llamado';
  const next: NextFunction = ((err?: unknown) => {
    recibido = err;
  }) as NextFunction;

  middleware(req, {} as Response, next);
  return recibido;
}

describe('authorize', () => {
  it('lets the allowed role through', () => {
    const error = ejecutar(authorize('admin'), requestConRol('admin'));
    // next() sin argumento: la peticion continua.
    expect(error).toBeUndefined();
  });

  it('rejects with 403 an authenticated but not allowed role', () => {
    const error = ejecutar(authorize('admin'), requestConRol('technical_lead'));
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it('rejects with 401 when there is no user on the request', () => {
    const error = ejecutar(authorize('admin'), requestConRol());
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('accepts any of the declared roles', () => {
    const middleware = authorize('admin', 'technical_lead');
    expect(ejecutar(middleware, requestConRol('admin'))).toBeUndefined();
    expect(ejecutar(middleware, requestConRol('technical_lead'))).toBeUndefined();
    expect(ejecutar(middleware, requestConRol('social_lead'))).toBeInstanceOf(ForbiddenError);
  });
});
