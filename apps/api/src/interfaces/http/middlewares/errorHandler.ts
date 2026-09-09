import type { ErrorRequestHandler } from 'express';
import Joi from 'joi';
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from 'sequelize';
import { AppError } from '../../../shared/errors/AppError.js';
import { fail } from '../../../shared/http/responses.js';
import { env } from '../../../shared/config/env.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err instanceof Joi.ValidationError) {
    const details = err.details.map((d) => ({
      path: d.path.join('.'),
      message: d.message,
    }));
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid request data', details);
  }

  if (err instanceof UniqueConstraintError) {
    return fail(res, 409, 'CONFLICT', 'Resource already exists', err.errors.map((e) => ({
      path: e.path,
      message: e.message,
    })));
  }

  if (err instanceof SequelizeValidationError) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid data', err.errors.map((e) => ({
      path: e.path,
      message: e.message,
    })));
  }

  if (env.NODE_ENV !== 'test') {
    console.error('[errorHandler]', err);
  }

  return fail(res, 500, 'INTERNAL_ERROR', 'Internal server error');
};
