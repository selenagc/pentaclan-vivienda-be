import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { listMunicipalitiesByProvince } from '../controllers/GeographyController.js';
import { provinceIdParamsSchema } from '../validators/geography.validators.js';

export const provincesRouter = Router();

provincesRouter.use(authenticate);

// Catalogo de solo lectura: sin POST/PUT/PATCH/DELETE.
provincesRouter.get(
  '/:id/municipalities',
  validate({ params: provinceIdParamsSchema }),
  listMunicipalitiesByProvince,
);
