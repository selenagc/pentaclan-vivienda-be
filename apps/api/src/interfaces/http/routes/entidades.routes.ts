import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { listEntidades, getEntidad } from '../controllers/EntidadesPublicasController.js';
import { entidadIdParamsSchema } from '../validators/entidades.validators.js';

export const entidadesRouter = Router();

entidadesRouter.use(authenticate);

// Catalogo de solo lectura: sin POST/PUT/PATCH/DELETE (PV-19).
// La carga se hace exclusivamente por seeder.
entidadesRouter.get('/', listEntidades);
entidadesRouter.get('/:id', validate({ params: entidadIdParamsSchema }), getEntidad);
