import { Router } from 'express';
import { login, refresh, logout, me } from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginSchema, refreshSchema, logoutSchema } from '../validators/auth.validators.js';

export const authRouter = Router();

authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/refresh', validate({ body: refreshSchema }), refresh);
authRouter.post('/logout', authenticate, validate({ body: logoutSchema }), logout);
authRouter.get('/me', authenticate, me);
