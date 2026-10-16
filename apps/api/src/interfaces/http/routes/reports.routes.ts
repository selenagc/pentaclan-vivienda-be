import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import { downloadPresentation } from '../controllers/ProjectsController.js';
import { projectIdParamsSchema } from '../validators/projects.validators.js';
import { fail } from '../../../shared/http/responses.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.get(
  '/projects/:id/presentation',
  validate({ params: projectIdParamsSchema }),
  downloadPresentation,
);

reportsRouter.use((_req, res) => {
  fail(res, 501, 'NOT_IMPLEMENTED', 'Reports module is not yet implemented');
});

