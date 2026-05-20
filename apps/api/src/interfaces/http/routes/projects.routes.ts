import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/ProjectsController.js';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from '../validators/projects.validators.js';

export const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.post('/', validate({ body: createProjectSchema }), createProject);
projectsRouter.get('/', validate({ query: listProjectsQuerySchema }), listProjects);
projectsRouter.get('/:id', validate({ params: projectIdParamsSchema }), getProject);
projectsRouter.put(
  '/:id',
  validate({ params: projectIdParamsSchema, body: updateProjectSchema }),
  updateProject,
);
projectsRouter.delete('/:id', validate({ params: projectIdParamsSchema }), deleteProject);
