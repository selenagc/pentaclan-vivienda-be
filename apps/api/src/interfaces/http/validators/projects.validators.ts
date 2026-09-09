import Joi from 'joi';

const uuid = Joi.string().uuid({ version: 'uuidv4' });
const publicEntityId = Joi.number().integer().positive();
const municipalityId = Joi.number().integer().positive();

/**
 * El creador se toma de la sesion. Se declaran como `forbidden()` (en vez de
 * dejarlos caer con stripUnknown) para que un cliente que intente fijar el
 * creador reciba un 400 explicito en lugar de un exito enganoso.
 */
const auditFields = {
  userId: Joi.any().forbidden(),
  id: Joi.any().forbidden(),
  createdAt: Joi.any().forbidden(),
  updatedAt: Joi.any().forbidden(),
};

export const projectIdParamsSchema = Joi.object({
  id: uuid.required(),
});

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  contractNo: Joi.string().trim().min(1).max(50).required(),
  publicEntityId: publicEntityId.required(),
  municipalityId: municipalityId.required(),
  ...auditFields,
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  contractNo: Joi.string().trim().min(1).max(50),
  publicEntityId,
  municipalityId,
  ...auditFields,
}).min(1);

export const listProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'contractNo', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().max(200),
  publicEntityId,
  municipalityId,
  userId: uuid,
});

export const assignUsersSchema = Joi.object({
  userId: uuid,
  userIds: Joi.array().items(uuid).min(1),
}).or('userId', 'userIds');

export const projectUserParamsSchema = Joi.object({
  id: uuid.required(),
  userId: uuid.required(),
});

