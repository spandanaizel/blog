import request from 'supertest';
import app from '../../app';

describe('GET /api/health', () => {
  it('returns a healthy status without requiring a database connection', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/healthy/i);
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /health (liveness)', () => {
  it('returns 200 with environment, version, and uptime, regardless of DB state', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.version).toBe('string');
    expect(typeof res.body.uptimeSeconds).toBe('number');
    expect(typeof res.body.environment).toBe('string');
  });
});

describe('GET /ready (readiness)', () => {
  it('reports not_ready with a 503 when MongoDB is not connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('not_ready');
    expect(res.body.database).toBe('disconnected');
  });
});

describe('Unknown routes', () => {
  it('returns a 404 with a JSON error body', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Protected routes without a token', () => {
  it('rejects access to /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects creating a post with 401', async () => {
    const res = await request(app).post('/api/posts').send({ title: 'x', content: 'x'.repeat(20) });
    expect(res.status).toBe(401);
  });
});
