import Joi from 'joi';
import { PROJECT_STATUS_VALUES } from '../../../domain/types/ProjectStatus.js';

const uuid = Joi.string().uuid({ version: 'uuidv4' });

export const projectIdParamsSchema = Joi.object({
  id: uuid.required(),
});

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().allow(null, '').max(5000),
  status: Joi.string().valid(...PROJECT_STATUS_VALUES).default('active'),
  startDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)),
  endDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)),
  clientId: Joi.alternatives().try(uuid, Joi.valid(null)),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().allow(null, '').max(5000),
  status: Joi.string().valid(...PROJECT_STATUS_VALUES),
  startDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)),
  endDate: Joi.alternatives().try(Joi.date().iso(), Joi.valid(null)),
  clientId: Joi.alternatives().try(uuid, Joi.valid(null)),
}).min(1);

export const listProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('name', 'status', 'startDate', 'endDate', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().max(200),
  status: Joi.string().valid(...PROJECT_STATUS_VALUES),
  clientId: uuid,
});
