import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  listDepartments,
  listProvincesByDepartment,
} from '../controllers/GeographyController.js';
import { departmentIdParamsSchema } from '../validators/geography.validators.js';

export const departmentsRouter = Router();

departmentsRouter.use(authenticate);

// Catalogo de solo lectura: sin POST/PUT/PATCH/DELETE.
departmentsRouter.get('/', listDepartments);
departmentsRouter.get(
  '/:id/provinces',
  validate({ params: departmentIdParamsSchema }),
  listProvincesByDepartment,
);
