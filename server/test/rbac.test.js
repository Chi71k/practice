import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createTestContext,
  loginAgent,
  resumePayload,
  vacancyPayload,
} from './helpers.js';

describe('CRUD ownership and role permissions', () => {
  let context;
  let candidateOne;
  let candidateTwo;
  let employerOne;
  let employerTwo;
  let admin;

  beforeEach(async () => {
    context = createTestContext();
    [
      candidateOne,
      candidateTwo,
      employerOne,
      employerTwo,
      admin,
    ] = await Promise.all([
      loginAgent(context.app, 'candidate1@test.local'),
      loginAgent(context.app, 'candidate2@test.local'),
      loginAgent(context.app, 'employer1@test.local'),
      loginAgent(context.app, 'employer2@test.local'),
      loginAgent(context.app, 'admin@test.local'),
    ]);
  });

  afterEach(() => {
    context.db.close();
  });

  it('lets a candidate manage only their own resume', async () => {
    const created = await candidateOne
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);

    expect(created.status).toBe(201);
    expect(created.body.data.ownerId).toBe('candidate-1');

    const forbiddenUpdate = await candidateTwo
      .patch(`/api/resumes/${created.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Stolen resume' });
    expect(forbiddenUpdate.status).toBe(404);

    const employerCreate = await employerOne
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);
    expect(employerCreate.status).toBe(403);

    const adminUpdate = await admin
      .patch(`/api/resumes/${created.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Reviewed by admin' });
    expect(adminUpdate.status).toBe(200);
  });

  it('lets an employer manage only their own vacancy', async () => {
    const created = await employerOne
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);

    expect(created.status).toBe(201);
    expect(created.body.data.employerId).toBe('employer-1');

    const otherEmployerUpdate = await employerTwo
      .patch(`/api/vacancies/${created.body.data.id}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Taken over' });
    expect(otherEmployerUpdate.status).toBe(404);

    const candidateCreate = await candidateOne
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);
    expect(candidateCreate.status).toBe(403);
  });

  it('enforces application ownership, duplicate checks and employer workflow', async () => {
    const resume = await candidateOne
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);
    const vacancy = await employerOne
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);

    const applicationPayload = {
      resumeId: resume.body.data.id,
      vacancyId: vacancy.body.data.id,
      coverLetter: 'Хочу работать в вашей команде.',
    };
    const created = await candidateOne
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send(applicationPayload);
    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('SUBMITTED');

    const duplicate = await candidateOne
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send(applicationPayload);
    expect(duplicate.status).toBe(409);

    const wrongEmployer = await employerTwo
      .patch(`/api/applications/${created.body.data.id}/status`)
      .set('Content-Type', 'application/json')
      .send({ status: 'REVIEWING' });
    expect(wrongEmployer.status).toBe(404);

    const reviewed = await employerOne
      .patch(`/api/applications/${created.body.data.id}/status`)
      .set('Content-Type', 'application/json')
      .send({ status: 'REVIEWING' });
    expect(reviewed.status).toBe(200);
    expect(reviewed.body.data.status).toBe('REVIEWING');

    const withdrawn = await candidateOne
      .post(`/api/applications/${created.body.data.id}/withdraw`)
      .set('Content-Type', 'application/json')
      .send({});
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body.data.status).toBe('WITHDRAWN');
  });

  it('does not allow a candidate to apply with another candidate resume', async () => {
    const otherResume = await candidateTwo
      .post('/api/resumes')
      .set('Content-Type', 'application/json')
      .send(resumePayload);
    const vacancy = await employerOne
      .post('/api/vacancies')
      .set('Content-Type', 'application/json')
      .send(vacancyPayload);

    const response = await candidateOne
      .post('/api/applications')
      .set('Content-Type', 'application/json')
      .send({
        resumeId: otherResume.body.data.id,
        vacancyId: vacancy.body.data.id,
        coverLetter: '',
      });
    expect(response.status).toBe(404);
  });

  it('allows only admin to list users and change roles', async () => {
    expect((await candidateOne.get('/api/admin/users')).status).toBe(403);

    const users = await admin.get('/api/admin/users');
    expect(users.status).toBe(200);
    expect(users.body.data).toHaveLength(5);

    const updated = await admin
      .patch('/api/admin/users/candidate-2/role')
      .set('Content-Type', 'application/json')
      .send({ role: 'EMPLOYER' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.role).toBe('EMPLOYER');
    expect((await candidateTwo.get('/api/auth/me')).status).toBe(401);
  });
});
