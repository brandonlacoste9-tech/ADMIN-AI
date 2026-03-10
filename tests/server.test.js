'use strict';

const request = require('supertest');
const app = require('../src/server');

let sessionId;

beforeAll(async () => {
  const res = await request(app).post('/api/sessions');
  expect(res.status).toBe(201);
  sessionId = res.body.sessionId;
});

afterAll(async () => {
  if (sessionId) {
    await request(app).delete(`/api/sessions/${sessionId}`);
  }
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('ADMIN-AI');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('POST /api/sessions', () => {
  it('creates a session and returns sessionId', async () => {
    const res = await request(app).post('/api/sessions');
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    expect(typeof res.body.sessionId).toBe('string');
    // Clean up
    await request(app).delete(`/api/sessions/${res.body.sessionId}`);
  });
});

describe('DELETE /api/sessions/:id', () => {
  it('deletes an existing session', async () => {
    const createRes = await request(app).post('/api/sessions');
    const id = createRes.body.sessionId;
    const res = await request(app).delete(`/api/sessions/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for unknown session', async () => {
    const res = await request(app).delete('/api/sessions/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/sessions/:id/history', () => {
  it('returns empty history for new session', async () => {
    const res = await request(app).get(`/api/sessions/${sessionId}/history`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  it('returns 404 for unknown session', async () => {
    const res = await request(app).get('/api/sessions/nonexistent/history');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sessions/:id/history', () => {
  it('clears conversation history', async () => {
    const res = await request(app).delete(`/api/sessions/${sessionId}/history`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/chat – validation', () => {
  it('returns 400 if sessionId is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'hello' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/sessionId/i);
  });

  it('returns 400 if message is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });

  it('returns 400 if message is empty', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId, message: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });

  it('returns 404 for unknown session', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId: 'nonexistent', message: 'hello' });
    expect(res.status).toBe(404);
  });

  it('returns 503 when OPENAI_API_KEY is not set', async () => {
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const res = await request(app)
      .post('/api/chat')
      .send({ sessionId, message: 'hello' });
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/OPENAI_API_KEY/i);
    if (original) process.env.OPENAI_API_KEY = original;
  });
});

describe('404 fallback', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
  });
});
