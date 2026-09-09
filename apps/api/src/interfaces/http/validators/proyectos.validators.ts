import Joi from 'joi';

const uuid = Joi.string().uuid({ version: 'uuidv4' });
const entidadPublicaId = Joi.number().integer().positive();

/**
 * El creador se toma de la sesion. Se declaran como `forbidden()` (en vez de
 * dejarlos caer con stripUnknown) para que un cliente que intente fijar el
 * creador reciba un 400 explicito en lugar de un exito enganoso.
 */
const camposDeAuditoria = {
  usuarioId: Joi.any().forbidden(),
  id: Joi.any().forbidden(),
  createdAt: Joi.any().forbidden(),
  updatedAt: Joi.any().forbidden(),
};

export const proyectoIdParamsSchema = Joi.object({
  id: uuid.required(),
});

export const createProyectoSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(200).required(),
  nroContrato: Joi.string().trim().min(1).max(50).required(),
  entidadPublicaId: entidadPublicaId.required(),
  ...camposDeAuditoria,
});

export const updateProyectoSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(200),
  nroContrato: Joi.string().trim().min(1).max(50),
  entidadPublicaId,
  ...camposDeAuditoria,
}).min(1);

export const listProyectosQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('nombre', 'nroContrato', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().max(200),
  entidadPublicaId,
  usuarioId: uuid,
});
