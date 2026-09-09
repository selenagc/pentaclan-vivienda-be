import Joi from 'joi';

// El catalogo usa PK entera autoincremental, no UUID.
const catalogId = Joi.number().integer().positive().required();

export const departamentoIdParamsSchema = Joi.object({
  id: catalogId,
});

export const provinciaIdParamsSchema = Joi.object({
  id: catalogId,
});
