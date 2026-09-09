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
  it('deja pasar al rol permitido', () => {
    const error = ejecutar(authorize('admin'), requestConRol('admin'));
    // next() sin argumento: la peticion continua.
    expect(error).toBeUndefined();
  });

  it('rechaza con 403 a un rol autenticado pero no permitido', () => {
    const error = ejecutar(authorize('admin'), requestConRol('technical_lead'));
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it('rechaza con 401 si no hay usuario en la request', () => {
    const error = ejecutar(authorize('admin'), requestConRol());
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('acepta cualquiera de los roles declarados', () => {
    const middleware = authorize('admin', 'technical_lead');
    expect(ejecutar(middleware, requestConRol('admin'))).toBeUndefined();
    expect(ejecutar(middleware, requestConRol('technical_lead'))).toBeUndefined();
    expect(ejecutar(middleware, requestConRol('social_lead'))).toBeInstanceOf(ForbiddenError);
  });
});
