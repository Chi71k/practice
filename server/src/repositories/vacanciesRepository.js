import { mapVacancy } from '../utils/mappers.js';
import { escapeLikePattern } from '../utils/sql.js';

const baseSelect = `
  SELECT v.*, u.name AS employer_name
  FROM vacancies v
  JOIN users u ON u.id = v.employer_id
`;

export const createVacanciesRepository = (db) => ({
  create(vacancy) {
    db.prepare(`
      INSERT INTO vacancies (
        id, employer_id, title, description, city, salary_from, salary_to,
        employment_type, skills, status, created_at, updated_at
      ) VALUES (
        @id, @employerId, @title, @description, @city, @salaryFrom, @salaryTo,
        @employmentType, @skills, @status, @createdAt, @updatedAt
      )
    `).run({ ...vacancy, skills: JSON.stringify(vacancy.skills) });
    return this.findById(vacancy.id);
  },

  findById(id) {
    return mapVacancy(db.prepare(`${baseSelect} WHERE v.id = ?`).get(id));
  },

  listPublished({ search, city, employmentType, limit, offset }) {
    const conditions = ["v.status = 'PUBLISHED'"];
    const params = {};

    if (search) {
      conditions.push(`(
        v.title LIKE @search ESCAPE '\\'
        OR v.description LIKE @search ESCAPE '\\'
        OR u.name LIKE @search ESCAPE '\\'
      )`);
      params.search = `%${escapeLikePattern(search)}%`;
    }
    if (city) {
      conditions.push('v.city = @city');
      params.city = city;
    }
    if (employmentType) {
      conditions.push('v.employment_type = @employmentType');
      params.employmentType = employmentType;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const items = db.prepare(`
      ${baseSelect} ${where}
      ORDER BY v.created_at DESC, v.id ASC
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset }).map(mapVacancy);
    const { total } = db.prepare(`
      SELECT COUNT(*) AS total
      FROM vacancies v JOIN users u ON u.id = v.employer_id
      ${where}
    `).get(params);

    return { items, total };
  },

  listByEmployer(employerId) {
    return db.prepare(`
      ${baseSelect} WHERE v.employer_id = ? ORDER BY v.created_at DESC, v.id ASC
    `).all(employerId).map(mapVacancy);
  },

  countByEmployer(employerId) {
    return db.prepare('SELECT COUNT(*) AS total FROM vacancies WHERE employer_id = ?')
      .get(employerId).total;
  },

  update(id, changes) {
    const columns = {
      title: 'title',
      description: 'description',
      city: 'city',
      salaryFrom: 'salary_from',
      salaryTo: 'salary_to',
      employmentType: 'employment_type',
      skills: 'skills',
      status: 'status',
    };
    const entries = Object.entries(changes).filter(([key]) => key in columns);
    if (!entries.length) return this.findById(id);

    const assignments = entries.map(([key]) => `${columns[key]} = @${key}`);
    const values = Object.fromEntries(entries);
    if ('skills' in values) values.skills = JSON.stringify(values.skills);
    values.id = id;
    values.updatedAt = new Date().toISOString();
    assignments.push('updated_at = @updatedAt');

    const result = db.prepare(`
      UPDATE vacancies SET ${assignments.join(', ')} WHERE id = @id
    `).run(values);
    return result.changes ? this.findById(id) : null;
  },

  delete(id) {
    return db.prepare('DELETE FROM vacancies WHERE id = ?').run(id).changes;
  },
});
