import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { listMyProjects } from '../controllers/ProjectsController.js';

export const meRouter = Router();

meRouter.use(authenticate);

// Proyectos asignados al usuario autenticado (PV-35)
meRouter.get('/projects', listMyProjects);
