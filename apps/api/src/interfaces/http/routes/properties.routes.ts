import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { index } from '../controllers/PropertiesController.js';
import { listPropertiesQuerySchema } from '../validators/properties.validators.js';

export const propertiesRouter = Router();

propertiesRouter.use(authenticate);

// Solo lectura: los inmuebles se dan de alta dentro del registro de una
// postulacion, para que no queden viviendas cargadas sin ficha asociada.
propertiesRouter.get('/', validate({ query: listPropertiesQuerySchema }), index);
