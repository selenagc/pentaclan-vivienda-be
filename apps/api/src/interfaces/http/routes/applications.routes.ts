import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  index,
  store,
  show,
  update,
  destroy,
  approve,
  reject,
} from '../controllers/ApplicationsController.js';
import {
  applicationIdParamsSchema,
  approveApplicationSchema,
  listApplicationsQuerySchema,
  registerApplicationSchema,
  rejectApplicationSchema,
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

// Decidir es del supervisor, con el admin como respaldo. A proposito deja fuera
// a los dos lideres, que son quienes registran: separar a quien levanta la
// ficha de quien la aprueba es control interno basico en un programa con fondos
// publicos.
const puedeDecidir = authorize('admin', 'project_supervisor');

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

// Rutas de accion y no un `PUT /:id` con `status`: aprobar cruza la frontera
// entre solicitante y beneficiario, no corrige un campo del formulario. Ademas
// asi cada transicion lleva su propio permiso y su propia validacion de cuerpo.
applicationsRouter.post(
  '/:id/approve',
  puedeDecidir,
  validate({ params: applicationIdParamsSchema, body: approveApplicationSchema }),
  approve,
);
applicationsRouter.post(
  '/:id/reject',
  puedeDecidir,
  validate({ params: applicationIdParamsSchema, body: rejectApplicationSchema }),
  reject,
);
