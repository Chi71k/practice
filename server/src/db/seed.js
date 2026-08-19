import { hash } from 'bcryptjs';
import { loadConfig } from '../config.js';
import { openDatabase } from './database.js';
import { runMigrations } from './migrate.js';

export const seedDatabase = async (db) => {
  const now = new Date().toISOString();
  const [candidateHash, employerHash, adminHash] = await Promise.all([
    hash('Candidate123!', 12),
    hash('Employer123!', 12),
    hash('Admin123!', 12),
  ]);

  const seed = db.transaction(() => {
    db.exec(`
      DELETE FROM applications;
      DELETE FROM vacancies;
      DELETE FROM resumes;
      DELETE FROM sessions;
      DELETE FROM users;
    `);

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @name, @role, @createdAt, @updatedAt)
    `);

    insertUser.run({
      id: 'user-candidate-demo',
      email: 'candidate@example.test',
      passwordHash: candidateHash,
      name: 'Demo Candidate',
      role: 'CANDIDATE',
      createdAt: now,
      updatedAt: now,
    });
    insertUser.run({
      id: 'user-employer-demo',
      email: 'employer@example.test',
      passwordHash: employerHash,
      name: 'Demo Employer',
      role: 'EMPLOYER',
      createdAt: now,
      updatedAt: now,
    });
    insertUser.run({
      id: 'user-admin-demo',
      email: 'admin@example.test',
      passwordHash: adminHash,
      name: 'Demo Admin',
      role: 'ADMIN',
      createdAt: now,
      updatedAt: now,
    });

    db.prepare(`
      INSERT INTO resumes (
        id, owner_id, title, summary, city, salary, skills,
        is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'resume-demo',
      'user-candidate-demo',
      'Junior Frontend Developer',
      'Учебное опубликованное резюме кандидата.',
      'Astana',
      350000,
      JSON.stringify(['HTML', 'CSS', 'JavaScript', 'React']),
      1,
      now,
      now,
    );

    db.prepare(`
      INSERT INTO vacancies (
        id, employer_id, title, description, city, salary_from, salary_to,
        employment_type, skills, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'vacancy-demo',
      'user-employer-demo',
      'Frontend Developer',
      'Учебная вакансия для практики CRUD и откликов.',
      'Almaty',
      400000,
      700000,
      'HYBRID',
      JSON.stringify(['JavaScript', 'React', 'Git']),
      'PUBLISHED',
      now,
      now,
    );

    db.prepare(`
      INSERT INTO applications (
        id, vacancy_id, candidate_id, resume_id, cover_letter,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'application-demo',
      'vacancy-demo',
      'user-candidate-demo',
      'resume-demo',
      'Хочу присоединиться к вашей команде.',
      'SUBMITTED',
      now,
      now,
    );
  });

  seed();
};

const isCli = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1];

if (isCli) {
  const config = loadConfig();
  const db = openDatabase(config.databasePath);
  try {
    runMigrations(db);
    await seedDatabase(db);
    console.log('Seed применён.');
    console.log('CANDIDATE: candidate@example.test / Candidate123!');
    console.log('EMPLOYER: employer@example.test / Employer123!');
    console.log('ADMIN: admin@example.test / Admin123!');
  } finally {
    db.close();
  }
}
