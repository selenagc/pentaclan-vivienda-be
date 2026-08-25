import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { index, store, show, update } from '../controllers/ProjectsController.js';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from '../validators/projects.validators.js';

export const projectsRouter = Router();

projectsRouter.use(authenticate);

// Toda la escritura es exclusiva de admin; la lectura queda abierta a
// cualquier usuario autenticado.
const puedeEscribir = authorize('admin');

projectsRouter.get('/', validate({ query: listProjectsQuerySchema }), index);
projectsRouter.get('/:id', validate({ params: projectIdParamsSchema }), show);
projectsRouter.post('/', puedeEscribir, validate({ body: createProjectSchema }), store);
projectsRouter.put(
  '/:id',
  puedeEscribir,
  validate({ params: projectIdParamsSchema, body: updateProjectSchema }),
  update,
);
