import { mapApplication } from '../utils/mappers.js';

const baseSelect = `
  SELECT
    a.*,
    v.title AS vacancy_title,
    v.employer_id,
    r.title AS resume_title,
    u.name AS candidate_name
  FROM applications a
  JOIN vacancies v ON v.id = a.vacancy_id
  JOIN resumes r ON r.id = a.resume_id
  JOIN users u ON u.id = a.candidate_id
`;

export const createApplicationsRepository = (db) => ({
  create(application) {
    db.prepare(`
      INSERT INTO applications (
        id, vacancy_id, candidate_id, resume_id, cover_letter,
        status, created_at, updated_at
      ) VALUES (
        @id, @vacancyId, @candidateId, @resumeId, @coverLetter,
        @status, @createdAt, @updatedAt
      )
    `).run(application);
    return this.findById(application.id);
  },

  findById(id) {
    return mapApplication(db.prepare(`${baseSelect} WHERE a.id = ?`).get(id));
  },

  findByCandidateAndVacancy(candidateId, vacancyId) {
    return mapApplication(db.prepare(`
      ${baseSelect} WHERE a.candidate_id = ? AND a.vacancy_id = ?
    `).get(candidateId, vacancyId));
  },

  listForCandidate(candidateId, { limit, offset }) {
    const items = db.prepare(`
      ${baseSelect}
      WHERE a.candidate_id = ?
      ORDER BY a.created_at DESC, a.id ASC
      LIMIT ? OFFSET ?
    `).all(candidateId, limit, offset).map(mapApplication);
    const { total } = db.prepare(`
      SELECT COUNT(*) AS total FROM applications WHERE candidate_id = ?
    `).get(candidateId);
    return { items, total };
  },

  listForEmployer(employerId, { limit, offset }) {
    const items = db.prepare(`
      ${baseSelect}
      WHERE v.employer_id = ?
      ORDER BY a.created_at DESC, a.id ASC
      LIMIT ? OFFSET ?
    `).all(employerId, limit, offset).map(mapApplication);
    const { total } = db.prepare(`
      SELECT COUNT(*) AS total
      FROM applications a
      JOIN vacancies v ON v.id = a.vacancy_id
      WHERE v.employer_id = ?
    `).get(employerId);
    return { items, total };
  },

  listAll({ limit, offset }) {
    const items = db.prepare(`
      ${baseSelect}
      ORDER BY a.created_at DESC, a.id ASC LIMIT ? OFFSET ?
    `).all(limit, offset).map(mapApplication);
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM applications').get();
    return { items, total };
  },

  countByCandidate(candidateId) {
    return db.prepare('SELECT COUNT(*) AS total FROM applications WHERE candidate_id = ?')
      .get(candidateId).total;
  },

  updateStatus(id, status) {
    const result = db.prepare(`
      UPDATE applications SET status = ?, updated_at = ? WHERE id = ?
    `).run(status, new Date().toISOString(), id);
    return result.changes ? this.findById(id) : null;
  },

  delete(id) {
    return db.prepare('DELETE FROM applications WHERE id = ?').run(id).changes;
  },
});
