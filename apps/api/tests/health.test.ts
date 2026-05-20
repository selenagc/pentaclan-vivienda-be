import express from 'express';
import request from 'supertest';
import { healthRouter } from '../src/interfaces/http/routes/health.routes.js';

describe('GET /health', () => {
  const app = express();
  app.use('/health', healthRouter);

  it('returns 200 with the standard success envelope', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
      },
    });
    expect(typeof res.body.data.uptime).toBe('number');
    expect(typeof res.body.data.timestamp).toBe('string');
  });
});
