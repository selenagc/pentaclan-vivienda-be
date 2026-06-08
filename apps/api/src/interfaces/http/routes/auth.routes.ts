import { Router } from 'express';
import { login, me } from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginSchema } from '../validators/auth.validators.js';

export const authRouter = Router();

authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.get('/me', authenticate, me);
