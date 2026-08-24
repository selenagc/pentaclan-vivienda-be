import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { index, store, show, update } from '../controllers/ProyectosController.js';
import {
  createProyectoSchema,
  listProyectosQuerySchema,
  proyectoIdParamsSchema,
  updateProyectoSchema,
} from '../validators/proyectos.validators.js';

export const proyectosRouter = Router();

proyectosRouter.use(authenticate);

// Toda la escritura es exclusiva de admin; la lectura queda abierta a
// cualquier usuario autenticado.
const puedeEscribir = authorize('admin');

proyectosRouter.get('/', validate({ query: listProyectosQuerySchema }), index);
proyectosRouter.get('/:id', validate({ params: proyectoIdParamsSchema }), show);
proyectosRouter.post('/', puedeEscribir, validate({ body: createProyectoSchema }), store);
proyectosRouter.put(
  '/:id',
  puedeEscribir,
  validate({ params: proyectoIdParamsSchema, body: updateProyectoSchema }),
  update,
);
