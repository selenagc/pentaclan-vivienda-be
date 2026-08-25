import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { listPublicEntities, getPublicEntity } from '../controllers/PublicEntitiesController.js';
import { publicEntityIdParamsSchema } from '../validators/public-entities.validators.js';

export const publicEntitiesRouter = Router();

publicEntitiesRouter.use(authenticate);
publicEntitiesRouter.get('/', listPublicEntities);
publicEntitiesRouter.get('/:id', validate({ params: publicEntityIdParamsSchema }), getPublicEntity);
