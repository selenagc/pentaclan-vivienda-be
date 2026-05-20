import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { fail } from '../../../shared/http/responses.js';

export const filesRouter = Router();

filesRouter.use(authenticate);

filesRouter.use((_req, res) => {
  fail(res, 501, 'NOT_IMPLEMENTED', 'Files module is not yet implemented');
});
