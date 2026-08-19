import { publicUser } from '../utils/mappers.js';

export const createUsersRepository = (db) => ({
  create(user) {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @name, @role, @createdAt, @updatedAt)
    `).run(user);
    return this.findById(user.id);
  },

  findAuthByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);
  },

  findAuthById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findById(id) {
    return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
  },

  list({ limit, offset }) {
    const rows = db.prepare(`
      SELECT * FROM users ORDER BY created_at DESC, id ASC LIMIT ? OFFSET ?
    `).all(limit, offset);
    const { total } = db.prepare('SELECT COUNT(*) AS total FROM users').get();
    return { items: rows.map(publicUser), total };
  },

  updateRole(id, role) {
    const now = new Date().toISOString();
    const result = db.prepare(`
      UPDATE users SET role = ?, updated_at = ? WHERE id = ?
    `).run(role, now, id);
    return result.changes ? this.findById(id) : null;
  },

  update(id, changes) {
    const columns = {
      email: 'email',
      name: 'name',
      passwordHash: 'password_hash',
    };
    const entries = Object.entries(changes).filter(([key]) => key in columns);
    if (!entries.length) return this.findById(id);

    const values = Object.fromEntries(entries);
    values.id = id;
    values.updatedAt = new Date().toISOString();
    const assignments = entries.map(([key]) => `${columns[key]} = @${key}`);
    assignments.push('updated_at = @updatedAt');

    const result = db.prepare(`
      UPDATE users SET ${assignments.join(', ')} WHERE id = @id
    `).run(values);
    return result.changes ? this.findById(id) : null;
  },

  countByRole(role) {
    return db.prepare('SELECT COUNT(*) AS total FROM users WHERE role = ?').get(role).total;
  },

  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
  },
});
