import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateMe,
  updateUser,
} from '../controllers/UsersController.js';
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
usersRouter.patch('/me', validate({ body: updateMeSchema }), updateMe);

// Admin-only.
usersRouter.post('/', authorize('admin'), validate({ body: createUserSchema }), createUser);
usersRouter.get('/', authorize('admin'), validate({ query: listUsersQuerySchema }), listUsers);
usersRouter.get('/:id', authorize('admin'), validate({ params: userIdParamsSchema }), getUser);
usersRouter.put(
  '/:id',
  authorize('admin'),
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  updateUser,
);
usersRouter.delete(
  '/:id',
  authorize('admin'),
  validate({ params: userIdParamsSchema }),
  deleteUser,
);
