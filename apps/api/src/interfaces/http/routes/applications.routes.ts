import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { index, store, show, update, destroy } from '../controllers/ApplicationsController.js';
import {
  applicationIdParamsSchema,
  listApplicationsQuerySchema,
  registerApplicationSchema,
  updateApplicationSchema,
} from '../validators/applications.validators.js';

export const applicationsRouter = Router();

applicationsRouter.use(authenticate);

// Registrar y corregir fichas es trabajo de campo: admin y los dos lideres.
// `project_supervisor` queda fuera de la escritura pero si puede leer.
const puedeRegistrar = authorize('admin', 'social_lead', 'technical_lead');

// Borrar es solo de admin: un lider que se equivoca pide la baja, no la
// ejecuta. Ademas es borrado logico, la ficha queda en la base.
const puedeBorrar = authorize('admin');

applicationsRouter.get('/', validate({ query: listApplicationsQuerySchema }), index);
applicationsRouter.get('/:id', validate({ params: applicationIdParamsSchema }), show);
applicationsRouter.post('/', puedeRegistrar, validate({ body: registerApplicationSchema }), store);
applicationsRouter.put(
  '/:id',
  puedeRegistrar,
  validate({ params: applicationIdParamsSchema, body: updateApplicationSchema }),
  update,
);
applicationsRouter.delete(
  '/:id',
  puedeBorrar,
  validate({ params: applicationIdParamsSchema }),
  destroy,
);
