import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { projectsRouter } from './projects.routes.js';
import { clientsRouter } from './clients.routes.js';
import { filesRouter } from './files.routes.js';
import { reportsRouter } from './reports.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/files', filesRouter);
apiRouter.use('/reports', reportsRouter);
