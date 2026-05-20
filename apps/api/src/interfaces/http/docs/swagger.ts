import path from 'node:path';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import yamljs from 'yamljs';

export function mountSwagger(app: Express): void {
  const yamlPath = path.resolve(process.cwd(), 'openapi.yaml');
  let document: object;
  try {
    document = yamljs.load(yamlPath);
  } catch (err) {
    console.warn('[swagger] Failed to load openapi.yaml at', yamlPath, err);
    return;
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document, { explorer: true }));
}
