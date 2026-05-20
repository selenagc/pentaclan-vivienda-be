import { createApp } from './app.js';
import { env } from './shared/config/env.js';
import { sequelize } from './infrastructure/database/sequelize.js';

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('[db] Connection established');
  } catch (err) {
    console.error('[db] Failed to connect:', err);
    process.exit(1);
  }

  const app = createApp();
  const port = env.PORT;

  app.listen(port, () => {
    console.log(`[server] Listening on http://localhost:${port}`);
    console.log(`[server] API docs at http://localhost:${port}/docs`);
  });
}

bootstrap();
