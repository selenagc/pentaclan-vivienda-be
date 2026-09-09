import Joi from 'joi';

const uuid = Joi.string().uuid({ version: 'uuidv4' });

export const propertyIdParamsSchema = Joi.object({
  id: uuid.required(),
});

/**
 * Solo lectura: el alta de inmuebles ocurre dentro del registro de una
 * postulacion, en una sola transaccion. Este listado alimenta el buscador del
 * formulario, que es lo que evita que la misma vivienda se cargue dos veces.
 */
export const listPropertiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('community', 'zone', 'address', 'createdAt').default('community'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  /** Busca en comunidad, zona y direccion. */
  search: Joi.string().trim().max(200),
  municipalityId: Joi.number().integer().positive(),
});
