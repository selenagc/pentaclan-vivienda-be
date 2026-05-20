import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './interfaces/http/routes/index.js';
import { errorHandler } from './interfaces/http/middlewares/errorHandler.js';
import { notFound } from './interfaces/http/middlewares/notFound.js';
import { mountSwagger } from './interfaces/http/docs/swagger.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
    },
  });
  app.use(limiter);

  mountSwagger(app);

  app.use('/', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
