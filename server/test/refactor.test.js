import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  createTestContext,
  loginAgent,
  resumePayload,
  vacancyPayload,
} from './helpers.js';

describe('refactor regression coverage', () => {
  let context;

  beforeEach(() => {
    context = createTestContext();
  });

  afterEach(() => {
    context.db.close();
  });

  it('preserves omitted resume and vacancy fields on PATCH and rejects empty PATCH', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    const employer = await loginAgent(context.app, 'employer1@test.local');
    const resume = await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);
    const vacancy = await employer
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);

    const updatedResume = await candidate
      .patch(`/api/resumes/${resume.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Renamed resume' });
    expect(updatedResume.body.data).toMatchObject({
      title: 'Renamed resume',
      skills: resumePayload.skills,
      isPublished: true,
    });

    const updatedVacancy = await employer
      .patch(`/api/vacancies/${vacancy.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Renamed vacancy' });
    expect(updatedVacancy.body.data).toMatchObject({
      title: 'Renamed vacancy',
      skills: vacancyPayload.skills,
      status: 'PUBLISHED',
    });

    const emptyPatch = await candidate
      .patch(`/api/resumes/${resume.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({});
    expect(emptyPatch.status).toBe(422);
  });

  it('enforces the bcrypt 72-byte boundary', async () => {
    const prefix = 'a'.repeat(72);
    const accepted = await request(context.app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'boundary@test.local',
        password: prefix,
        name: 'Boundary User',
        role: 'CANDIDATE',
      });
    expect(accepted.status).toBe(201);

    const rejected = await request(context.app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send({
        email: 'too-long@test.local',
        password: `${prefix}x`,
        name: 'Long Password',
        role: 'CANDIDATE',
      });
    expect(rejected.status).toBe(422);
    expect(rejected.body.error.details).toContainEqual(expect.objectContaining({ path: 'password' }));
  });

  it('maps malformed, oversized and unsupported request bodies to client errors', async () => {
    const wrongType = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'text/plain')
      .send('{}');
    expect(wrongType.status).toBe(415);
    expect(wrongType.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');

    const malformed = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(malformed.status).toBe(400);

    const oversized = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'large@test.local', password: 'x'.repeat(110_000) });
    expect(oversized.status).toBe(413);
    expect(oversized.body.error.code).toBe('PAYLOAD_TOO_LARGE');

    const unsupportedEncoding = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'compress')
      .send('{}');
    expect(unsupportedEncoding.status).toBe(415);

    const malformedCompressedBody = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'br')
      .send('{}');
    expect(malformedCompressedBody.status).toBe(400);
  });

  it('rejects unsafe authenticated requests from an untrusted Origin', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    const rejected = await candidate
      .post('/api/auth/logout')
      .set('Origin', 'http://localhost:4444')
      .set('Content-Type', 'application/json')
      .send({});
    expect(rejected.status).toBe(403);

    const accepted = await candidate
      .post('/api/auth/logout')
      .set('Origin', context.config.clientOrigin)
      .set('Content-Type', 'application/json')
      .send({});
    expect(accepted.status).toBe(200);
  });

  it('supports admin user CRUD without creating a session for the new user', async () => {
    const admin = await loginAgent(context.app, 'admin@test.local');
    const created = await admin
      .post('/api/admin/users')
      .set('Content-Type', 'application/json')
      .send({
        email: 'managed@test.local',
        password: 'ManagedPassword123!',
        name: 'Managed User',
        role: 'EMPLOYER',
      });
    expect(created.status).toBe(201);
    expect(created.body.data.role).toBe('EMPLOYER');
    expect(context.db.prepare('SELECT COUNT(*) total FROM sessions WHERE user_id = ?')
      .get(created.body.data.id).total).toBe(0);

    const fetched = await admin.get(`/api/admin/users/${created.body.data.id}`);
    expect(fetched.status).toBe(200);

    const updated = await admin
      .patch(`/api/admin/users/${created.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ email: 'renamed@test.local', name: 'Renamed User' });
    expect(updated.body.data).toMatchObject({
      email: 'renamed@test.local',
      name: 'Renamed User',
    });

    expect((await admin.delete(`/api/admin/users/${created.body.data.id}`)).status).toBe(200);
    expect((await admin.get(`/api/admin/users/${created.body.data.id}`)).status).toBe(404);
  });

  it('updates the profile and revokes every session after password change', async () => {
    const firstSession = await loginAgent(context.app, 'candidate1@test.local');
    const secondSession = await loginAgent(context.app, 'candidate1@test.local');

    const profile = await firstSession
      .patch('/api/auth/me')
      .set('Content-Type', 'application/json')
      .send({ email: 'candidate.renamed@test.local', name: 'Renamed Candidate' });
    expect(profile.body.data).toMatchObject({
      email: 'candidate.renamed@test.local',
      name: 'Renamed Candidate',
    });

    const changed = await firstSession
      .patch('/api/auth/me/password')
      .set('Content-Type', 'application/json')
      .send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });
    expect(changed.status).toBe(200);
    expect((await firstSession.get('/api/auth/me')).status).toBe(401);
    expect((await secondSession.get('/api/auth/me')).status).toBe(401);

    const login = await request(context.app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'candidate.renamed@test.local', password: 'NewPassword123!' });
    expect(login.status).toBe(200);
  });

  it('protects role and deletion invariants', async () => {
    const admin = await loginAgent(context.app, 'admin@test.local');
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);

    const roleConflict = await admin
      .patch('/api/admin/users/candidate-1/role')
      .set('Content-Type', 'application/json')
      .send({ role: 'EMPLOYER' });
    expect(roleConflict.status).toBe(409);
    expect(roleConflict.body.error.details.resumes).toBe(1);

    expect((await admin.delete('/api/admin/users/candidate-1')).status).toBe(409);

    const lastAdmin = await admin
      .patch('/api/admin/users/admin-1/role')
      .set('Content-Type', 'application/json')
      .send({ role: 'CANDIDATE' });
    expect(lastAdmin.status).toBe(409);
    expect((await admin.delete('/api/admin/users/admin-1')).status).toBe(409);
  });

  it('paginates candidate applications and prevents terminal status changes', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    const employer = await loginAgent(context.app, 'employer1@test.local');
    const resume = await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);

    const applicationIds = [];
    for (const suffix of ['One', 'Two']) {
      const vacancy = await employer
        .post('/api/vacancies')
        .set('Content-Type', 'application/json')
        .send({ ...vacancyPayload, title: `Vacancy ${suffix}` });
      const application = await candidate
        .post('/api/applications')
        .set('Content-Type', 'application/json')
        .send({ vacancyId: vacancy.body.data.id, resumeId: resume.body.data.id });
      applicationIds.push(application.body.data.id);
    }

    const page = await candidate.get('/api/applications?page=1&limit=1');
    expect(page.status).toBe(200);
    expect(page.body.data).toHaveLength(1);
    expect(page.body.meta).toMatchObject({ page: 1, limit: 1, total: 2, pages: 2 });

    const employerPage = await employer.get('/api/applications?page=2&limit=1');
    expect(employerPage.status).toBe(200);
    expect(employerPage.body.data).toHaveLength(1);
    expect(employerPage.body.meta).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      pages: 2,
    });

    await employer
      .patch(`/api/applications/${applicationIds[0]}/status`)
      .set('Content-Type', 'application/json')
      .send({ status: 'ACCEPTED' });
    const terminalChange = await employer
      .patch(`/api/applications/${applicationIds[0]}/status`)
      .set('Content-Type', 'application/json')
      .send({ status: 'REJECTED' });
    expect(terminalChange.status).toBe(409);
  });

  it('treats LIKE metacharacters as literal search input', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send({ ...resumePayload, title: '100% Frontend Engineer' });
    await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send({ ...resumePayload, title: 'Ordinary Frontend Engineer' });

    const result = await request(context.app).get('/api/resumes').query({ search: '%' });
    expect(result.status).toBe(200);
    expect(result.body.data.map((resume) => resume.title)).toEqual(['100% Frontend Engineer']);
  });

  it('escapes LIKE metacharacters in vacancy search', async () => {
    const employer = await loginAgent(context.app, 'employer1@test.local');
    for (const title of ['100% Remote', 'Role_One', 'Path\\Role', 'RoleXOne']) {
      await employer
        .post('/api/vacancies')
        .set('Content-Type', 'application/json')
        .send({ ...vacancyPayload, title });
    }

    const percent = await request(context.app).get('/api/vacancies').query({ search: '%' });
    expect(percent.body.data.map((vacancy) => vacancy.title)).toEqual(['100% Remote']);

    const underscore = await request(context.app).get('/api/vacancies').query({ search: '_' });
    expect(underscore.body.data.map((vacancy) => vacancy.title)).toEqual(['Role_One']);

    const backslash = await request(context.app).get('/api/vacancies').query({ search: '\\' });
    expect(backslash.body.data.map((vacancy) => vacancy.title)).toEqual(['Path\\Role']);
  });

  it('returns 409 for a referenced resume and cascades vacancy applications', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    const employer = await loginAgent(context.app, 'employer1@test.local');
    const resume = await candidate
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);
    const vacancy = await employer
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);
    const application = await candidate
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send({ resumeId: resume.body.data.id, vacancyId: vacancy.body.data.id });

    const resumeDeletion = await candidate.delete(`/api/resumes/${resume.body.data.id}`);
    expect(resumeDeletion.status).toBe(409);
    expect(resumeDeletion.body.error.code).toBe('RESOURCE_IN_USE');

    expect((await employer.delete(`/api/vacancies/${vacancy.body.data.id}`)).status).toBe(200);
    expect((await candidate.get(`/api/applications/${application.body.data.id}`)).status).toBe(404);
  });

  it('keeps pagination stable when creation timestamps are equal', async () => {
    const candidate = await loginAgent(context.app, 'candidate1@test.local');
    const createdIds = [];
    for (const title of ['Stable A', 'Stable B', 'Stable C']) {
      const response = await candidate
        .post('/api/resumes')
        .set('Content-Type', 'application/json')
        .send({ ...resumePayload, title });
      createdIds.push(response.body.data.id);
    }
    context.db.prepare('UPDATE resumes SET created_at = ?')
      .run('2026-01-01T00:00:00.000Z');

    const expectedIds = [...createdIds].sort();
    const firstRun = [];
    const secondRun = [];
    for (let page = 1; page <= 3; page += 1) {
      firstRun.push((await request(context.app)
        .get('/api/resumes')
        .query({ page, limit: 1 })).body.data[0].id);
      secondRun.push((await request(context.app)
        .get('/api/resumes')
        .query({ page, limit: 1 })).body.data[0].id);
    }
    expect(firstRun).toEqual(expectedIds);
    expect(secondRun).toEqual(expectedIds);
  });

  it('starts an HTTP listener and serves the health endpoint', async () => {
    const server = await new Promise((resolve) => {
      const listener = context.app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    try {
      const response = await request(server).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ok');
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it('does not allow ADMIN to create role-owned domain resources', async () => {
    const admin = await loginAgent(context.app, 'admin@test.local');
    expect((await admin
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload)).status).toBe(403);
    expect((await admin
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload)).status).toBe(403);
  });
});
