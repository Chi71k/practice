import { publicUser } from '../utils/mappers.js';

export const createSessionsRepository = (db) => ({
  create({ tokenHash, userId, expiresAt, createdAt }) {
    db.prepare(`
      INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, userId, expiresAt, createdAt);
  },

  findUserByTokenHash(tokenHash) {
    const row = db.prepare(`
      SELECT
        s.token_hash,
        s.expires_at,
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        u.updated_at
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `).get(tokenHash);

    if (!row) return null;
    return {
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      user: publicUser(row),
    };
  },

  deleteByTokenHash(tokenHash) {
    return db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash).changes;
  },

  deleteForUser(userId) {
    return db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId).changes;
  },

  deleteExpired(now = Date.now()) {
    return db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now).changes;
  },
});
