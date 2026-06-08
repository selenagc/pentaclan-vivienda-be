import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import * as users from '../controllers/UsersController.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateMeSchema,
  updateUserSchema,
  userIdParamsSchema,
} from '../validators/users.validators.js';

export const usersRouter = Router();

usersRouter.use(authenticate);

// Auto-servicio (cualquier usuario autenticado). Debe ir ANTES de '/:id'.
usersRouter.patch('/me', validate({ body: updateMeSchema }), users.updateMe);

// Admin-only (CRUD de recurso).
usersRouter.post('/', authorize('admin'), validate({ body: createUserSchema }), users.store);
usersRouter.get('/', authorize('admin'), validate({ query: listUsersQuerySchema }), users.index);
usersRouter.get('/:id', authorize('admin'), validate({ params: userIdParamsSchema }), users.show);
usersRouter.put('/:id', authorize('admin'), validate({ params: userIdParamsSchema, body: updateUserSchema }), users.update,);
usersRouter.delete( '/:id', authorize('admin'), validate({ params: userIdParamsSchema }), users.destroy);
