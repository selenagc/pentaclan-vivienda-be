import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { listMunicipiosByProvincia } from '../controllers/GeografiaController.js';
import { provinciaIdParamsSchema } from '../validators/geografia.validators.js';

export const provinciasRouter = Router();

provinciasRouter.use(authenticate);

// Catalogo de solo lectura: sin POST/PUT/PATCH/DELETE.
provinciasRouter.get(
  '/:id/municipios',
  validate({ params: provinciaIdParamsSchema }),
  listMunicipiosByProvincia,
);
