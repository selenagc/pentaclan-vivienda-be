import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { fail } from '../../../shared/http/responses.js';

export const clientsRouter = Router();

clientsRouter.use(authenticate);

clientsRouter.use((_req, res) => {
  fail(res, 501, 'NOT_IMPLEMENTED', 'Clients module is not yet implemented');
});
