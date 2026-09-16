import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getQuestions } from '../controllers/DiagnosticController.js';

export const evaluationQuestionsRouter = Router();

evaluationQuestionsRouter.use(authenticate);

evaluationQuestionsRouter.get('/', getQuestions);
