import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  index,
  store,
  show,
  update,
  getAssignments,
  assignUsers,
  unassignUser,
} from '../controllers/ProjectsController.js';
import {
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectSchema,
  assignUsersSchema,
  projectUserParamsSchema,
} from '../validators/projects.validators.js';

export const projectsRouter = Router();

projectsRouter.use(authenticate);

// Toda la escritura es exclusiva de admin; la lectura queda abierta a
// cualquier usuario autenticado (con restriccion de proyecto para evaluadores).
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

// Gestión de evaluadores asignados al proyecto (solo admin)
projectsRouter.get(
  '/:id/assignments',
  puedeEscribir,
  validate({ params: projectIdParamsSchema }),
  getAssignments,
);
projectsRouter.post(
  '/:id/assignments',
  puedeEscribir,
  validate({ params: projectIdParamsSchema, body: assignUsersSchema }),
  assignUsers,
);
projectsRouter.delete(
  '/:id/assignments/:userId',
  puedeEscribir,
  validate({ params: projectUserParamsSchema }),
  unassignUser,
);

