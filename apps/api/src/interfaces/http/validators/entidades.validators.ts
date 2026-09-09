import Joi from 'joi';

// El catalogo usa PK entera autoincremental, no UUID.
export const entidadIdParamsSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
