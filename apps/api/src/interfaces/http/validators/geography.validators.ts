import Joi from 'joi';

// El catalogo usa PK entera autoincremental, no UUID.
const catalogId = Joi.number().integer().positive().required();

export const departmentIdParamsSchema = Joi.object({
  id: catalogId,
});

export const provinceIdParamsSchema = Joi.object({
  id: catalogId,
});
