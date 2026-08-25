import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/interfaces/http/middlewares/errorHandler.js';

describe('errorHandler', () => {
  const app = express();
  app.use(express.json());
  app.post('/echo', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use(errorHandler);

  it('responds 400 when the body is not valid JSON', async () => {
    const res = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      // Lo que manda Postman cuando `{{entidadId}}` no esta definida.
      .send('{"name":"x","publicEntityId":}');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'INVALID_JSON' },
    });
  });
});
