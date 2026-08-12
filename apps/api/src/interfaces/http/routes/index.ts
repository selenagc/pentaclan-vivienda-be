import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { projectsRouter } from './projects.routes.js';
import { departamentosRouter } from './departamentos.routes.js';
import { provinciasRouter } from './provincias.routes.js';
import { clientsRouter } from './clients.routes.js';
import { filesRouter } from './files.routes.js';
import { reportsRouter } from './reports.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/departamentos', departamentosRouter);
apiRouter.use('/provincias', provinciasRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/files', filesRouter);
apiRouter.use('/reports', reportsRouter);
