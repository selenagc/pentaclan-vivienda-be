import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { ValidationError } from '../../../shared/errors/ValidationError.js';

export interface ValidationSchemas {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    const targets: Array<['body' | 'params' | 'query', ObjectSchema | undefined]> = [
      ['body', schemas.body],
      ['params', schemas.params],
      ['query', schemas.query],
    ];

    const errors: Array<{ source: string; path: string; message: string }> = [];

    for (const [source, schema] of targets) {
      if (!schema) continue;
      const { value, error } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (error) {
        for (const d of error.details) {
          errors.push({ source, path: d.path.join('.'), message: d.message });
        }
      } else {
        // Replace request property with the sanitized value
        (req as unknown as Record<string, unknown>)[source] = value;
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError('Invalid request data', errors));
    }
    next();
  };
}
