import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  listDepartamentos,
  listProvinciasByDepartamento,
} from '../controllers/GeografiaController.js';
import { departamentoIdParamsSchema } from '../validators/geografia.validators.js';

export const departamentosRouter = Router();

departamentosRouter.use(authenticate);

// Catalogo de solo lectura: sin POST/PUT/PATCH/DELETE.
departamentosRouter.get('/', listDepartamentos);
departamentosRouter.get(
  '/:id/provincias',
  validate({ params: departamentoIdParamsSchema }),
  listProvinciasByDepartamento,
);
