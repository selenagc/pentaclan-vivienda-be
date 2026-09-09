import Joi from 'joi';
import { ROLE_VALUES } from '../../../domain/types/Role.js';

const uuid = Joi.string().uuid({ version: 'uuidv4' });

export const userIdParamsSchema = Joi.object({
  id: uuid.required(),
});

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid(...ROLE_VALUES).required(),
});

// Admin: puede editar cualquier campo, incluido el rol.
export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(128),
  role: Joi.string().valid(...ROLE_VALUES),
}).min(1);

// Auto-edicion: el usuario NO puede cambiar su propio rol.
export const updateMeSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(128),
}).min(1);

export const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().max(200),
  role: Joi.string().valid(...ROLE_VALUES),
});
