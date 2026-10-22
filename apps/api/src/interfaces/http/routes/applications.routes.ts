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
  preselect,
} from '../controllers/ApplicationsController.js';
import {
  applicationIdParamsSchema,
  approveApplicationSchema,
  listApplicationsQuerySchema,
  preselectApplicationSchema,
  registerApplicationSchema,
  rejectApplicationSchema,
  updateApplicationSchema,
} from '../validators/applications.validators.js';
import { uploadSinglePhoto } from '../middlewares/uploadPhoto.js';
import {
  showDiagnostic,
  saveTechnical,
  saveSocial,
  getPhotoUploadUrl,
  confirmPhotoUpload,
  listPhotos,
  deletePhoto,
} from '../controllers/DiagnosticController.js';
import {
  technicalDiagnosticSchema,
  socialDiagnosticSchema,
  getPhotoUploadUrlSchema,
  createPhotoSchema,
  listPhotosQuerySchema,
  photoIdParamsSchema,
} from '../validators/diagnostic.validators.js';

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

// Preseleccionar la postulacion (pasar a 'under_review') tras la evaluacion en campo.
// Lo pueden hacer admin, supervisor, y los lideres asignados al proyecto.
const puedePreseleccionar = authorize(
  'admin',
  'project_supervisor',
  'social_lead',
  'technical_lead',
);

// Evaluacion y ficha diagnostico (PV-39)
// Lectura para los involucrados en el proyecto
const puedeVerDiagnostico = authorize(
  'admin',
  'project_supervisor',
  'technical_lead',
  'social_lead',
);
// Separacion estricta de roles:
// El lider tecnico solo llena datos tecnicos/constructivos
const puedeLlenarTecnico = authorize('admin', 'technical_lead');
// El lider social solo llena datos sociales/demograficos
const puedeLlenarSocial = authorize('admin', 'social_lead');

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

// Ficha Diagnostico
applicationsRouter.get(
  '/:id/diagnostic',
  puedeVerDiagnostico,
  validate({ params: applicationIdParamsSchema }),
  showDiagnostic,
);
applicationsRouter.put(
  '/:id/diagnostic/technical',
  puedeLlenarTecnico,
  validate({ params: applicationIdParamsSchema, body: technicalDiagnosticSchema }),
  saveTechnical,
);
applicationsRouter.put(
  '/:id/diagnostic/social',
  puedeLlenarSocial,
  validate({ params: applicationIdParamsSchema, body: socialDiagnosticSchema }),
  saveSocial,
);

// Fotografías de inspección en campo (S3 + Captura en vivo)
applicationsRouter.post(
  '/:id/diagnostic/photos/upload-url',
  puedeRegistrar,
  validate({ params: applicationIdParamsSchema, body: getPhotoUploadUrlSchema }),
  getPhotoUploadUrl,
);
applicationsRouter.post(
  '/:id/diagnostic/photos',
  puedeRegistrar,
  uploadSinglePhoto('image'),
  validate({ params: applicationIdParamsSchema, body: createPhotoSchema }),
  confirmPhotoUpload,
);
applicationsRouter.get(
  '/:id/diagnostic/photos',
  puedeVerDiagnostico,
  validate({ params: applicationIdParamsSchema, query: listPhotosQuerySchema }),
  listPhotos,
);
applicationsRouter.delete(
  '/:id/diagnostic/photos/:photoId',
  puedeRegistrar,
  validate({ params: photoIdParamsSchema }),
  deletePhoto,
);

// Rutas de accion y no un `PUT /:id` con `status`: aprobar cruza la frontera

// entre solicitante y beneficiario, no corrige un campo del formulario. Ademas
// asi cada transicion lleva su propio permiso y su propia validacion de cuerpo.
applicationsRouter.post(
  '/:id/preselect',
  puedePreseleccionar,
  validate({ params: applicationIdParamsSchema, body: preselectApplicationSchema }),
  preselect,
);
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
