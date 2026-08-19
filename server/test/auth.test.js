import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createTestContext, loginAgent } from './helpers.js';

describe('authentication', () => {
  let context;

  beforeEach(() => {
    context = createTestContext();
  });

  afterEach(() => {
    context.db.close();
  });

  it('registers a candidate, sets a secure session cookie and returns /me', async () => {
    const agent = request.agent(context.app);
    const registration = await agent
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'new.user@example.test',
        password: 'StrongPassword123!',
        name: 'New User',
        role: 'CANDIDATE',
      });

    expect(registration.status).toBe(201);
    expect(registration.body.data).toMatchObject({
      email: 'new.user@example.test',
      role: 'CANDIDATE',
    });
    expect(registration.body.data).not.toHaveProperty('password_hash');
    expect(registration.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(registration.headers['set-cookie'][0]).toContain('SameSite=Lax');

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('new.user@example.test');
  });

  it('does not allow public ADMIN registration', async () => {
    const response = await request(context.app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'attacker@example.test',
        password: 'StrongPassword123!',
        name: 'Attacker',
        role: 'ADMIN',
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns the same unauthorized error for invalid credentials', async () => {
    const response = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: 'candidate1@test.local',
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Неверный email или пароль',
    });
  });

  it('invalidates a session on logout', async () => {
    const agent = await loginAgent(context.app, 'candidate1@test.local');
    expect((await agent.get('/api/auth/me')).status).toBe(200);
    expect((await agent
      .post('/api/auth/logout')
      .set('Content-Type', 'application/json')
      .send({})).status).toBe(200);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('rejects an expired session', async () => {
    const agent = await loginAgent(context.app, 'candidate1@test.local');
    context.db.prepare('UPDATE sessions SET expires_at = ?').run(Date.now() - 1000);

    const response = await agent.get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.headers['set-cookie'][0]).toContain('practice_session=');
  });

  it('returns a stable validation error shape', async () => {
    const response = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'not-an-email' });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Запрос не прошёл валидацию',
        details: expect.any(Array),
      },
    });
  });
});
