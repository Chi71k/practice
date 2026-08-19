import { hashSync } from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { openDatabase } from '../src/db/database.js';
import { runMigrations } from '../src/db/migrate.js';

const testUsers = [
  ['candidate-1', 'candidate1@test.local', 'Candidate One', 'CANDIDATE'],
  ['candidate-2', 'candidate2@test.local', 'Candidate Two', 'CANDIDATE'],
  ['employer-1', 'employer1@test.local', 'Employer One', 'EMPLOYER'],
  ['employer-2', 'employer2@test.local', 'Employer Two', 'EMPLOYER'],
  ['admin-1', 'admin@test.local', 'Admin One', 'ADMIN'],
];

export const createTestContext = () => {
  const config = loadConfig({
    nodeEnv: 'test',
    databasePath: ':memory:',
    clientOrigin: 'http://localhost:5173',
    sessionTtlMs: 60 * 60 * 1000,
  });
  const db = openDatabase(':memory:');
  runMigrations(db);

  const passwordHash = hashSync('Password123!', 4);
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const [id, email, name, role] of testUsers) {
    insert.run(id, email, passwordHash, name, role, now, now);
  }

  const app = createApp({ db, config });
  return { app, db, config };
};

export const loginAgent = async (app, email) => {
  const agent = request.agent(app);
  const response = await agent
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email, password: 'Password123!' });

  if (response.status !== 200) {
    throw new Error(`Test login failed for ${email}: ${response.status}`);
  }
  return agent;
};

export const resumePayload = {
  title: 'Frontend Developer',
  summary: 'Подробное тестовое описание опыта кандидата.',
  city: 'Astana',
  salary: 500000,
  skills: ['JavaScript', 'React'],
  isPublished: true,
};

export const vacancyPayload = {
  title: 'React Developer',
  description: 'Подробное тестовое описание открытой вакансии.',
  city: 'Almaty',
  salaryFrom: 400000,
  salaryTo: 800000,
  employmentType: 'HYBRID',
  skills: ['JavaScript', 'React'],
  status: 'PUBLISHED',
};
