import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { fail } from '../../../shared/http/responses.js';

export const reportsRouter = Router();

reportsRouter.use(authenticate);

reportsRouter.use((_req, res) => {
  fail(res, 501, 'NOT_IMPLEMENTED', 'Reports module is not yet implemented');
});
