import { Router } from 'express';
import { healthCheck } from '../controllers/HealthController.js';

export const healthRouter = Router();

healthRouter.get('/', healthCheck);
