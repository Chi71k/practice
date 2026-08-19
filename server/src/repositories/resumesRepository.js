import { mapResume } from '../utils/mappers.js';
import { escapeLikePattern } from '../utils/sql.js';

const baseSelect = `
  SELECT r.*, u.name AS owner_name
  FROM resumes r
  JOIN users u ON u.id = r.owner_id
`;

export const createResumesRepository = (db) => ({
  create(resume) {
    db.prepare(`
      INSERT INTO resumes (
        id, owner_id, title, summary, city, salary, skills,
        is_published, created_at, updated_at
      ) VALUES (
        @id, @ownerId, @title, @summary, @city, @salary, @skills,
        @isPublished, @createdAt, @updatedAt
      )
    `).run({
      ...resume,
      skills: JSON.stringify(resume.skills),
      isPublished: resume.isPublished ? 1 : 0,
    });
    return this.findById(resume.id);
  },

  findById(id) {
    return mapResume(db.prepare(`${baseSelect} WHERE r.id = ?`).get(id));
  },

  listPublished({ search, city, limit, offset }) {
    const conditions = ['r.is_published = 1'];
    const params = {};

    if (search) {
      conditions.push(`(
        r.title LIKE @search ESCAPE '\\'
        OR r.summary LIKE @search ESCAPE '\\'
        OR u.name LIKE @search ESCAPE '\\'
      )`);
      params.search = `%${escapeLikePattern(search)}%`;
    }
    if (city) {
      conditions.push('r.city = @city');
      params.city = city;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const items = db.prepare(`
      ${baseSelect} ${where}
      ORDER BY r.created_at DESC, r.id ASC
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset }).map(mapResume);
    const { total } = db.prepare(`
      SELECT COUNT(*) AS total
      FROM resumes r JOIN users u ON u.id = r.owner_id
      ${where}
    `).get(params);

    return { items, total };
  },

  listByOwner(ownerId) {
    return db.prepare(`
      ${baseSelect} WHERE r.owner_id = ? ORDER BY r.created_at DESC, r.id ASC
    `).all(ownerId).map(mapResume);
  },

  countByOwner(ownerId) {
    return db.prepare('SELECT COUNT(*) AS total FROM resumes WHERE owner_id = ?')
      .get(ownerId).total;
  },

  update(id, changes) {
    const columns = {
      title: 'title',
      summary: 'summary',
      city: 'city',
      salary: 'salary',
      skills: 'skills',
      isPublished: 'is_published',
    };
    const entries = Object.entries(changes).filter(([key]) => key in columns);
    if (!entries.length) return this.findById(id);

    const assignments = entries.map(([key]) => `${columns[key]} = @${key}`);
    const values = Object.fromEntries(entries);
    if ('skills' in values) values.skills = JSON.stringify(values.skills);
    if ('isPublished' in values) values.isPublished = values.isPublished ? 1 : 0;
    values.id = id;
    values.updatedAt = new Date().toISOString();
    assignments.push('updated_at = @updatedAt');

    const result = db.prepare(`
      UPDATE resumes SET ${assignments.join(', ')} WHERE id = @id
    `).run(values);
    return result.changes ? this.findById(id) : null;
  },

  delete(id) {
    return db.prepare('DELETE FROM resumes WHERE id = ?').run(id).changes;
  },
});
