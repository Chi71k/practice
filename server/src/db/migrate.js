import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const defaultMigrationsDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrations',
);

const checksum = (sql) => createHash('sha256').update(sql).digest('hex');

export const runMigrations = (db, { migrationsDirectory = defaultMigrationsDirectory } = {}) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL,
      checksum TEXT
    )
  `);

  const columns = db.prepare('PRAGMA table_info(schema_migrations)').all();
  if (!columns.some((column) => column.name === 'checksum')) {
    db.exec('ALTER TABLE schema_migrations ADD COLUMN checksum TEXT');
  }

  const files = fs.readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const migrations = new Map(files.map((file) => {
    const sql = fs.readFileSync(path.join(migrationsDirectory, file), 'utf8');
    return [file, { sql, checksum: checksum(sql) }];
  }));
  const appliedRows = db.prepare(
    'SELECT name, checksum FROM schema_migrations ORDER BY name',
  ).all();
  const applied = new Set();

  for (const row of appliedRows) {
    const migration = migrations.get(row.name);
    if (!migration) {
      throw new Error(`Применённая миграция отсутствует на диске: ${row.name}`);
    }
    if (row.checksum && row.checksum !== migration.checksum) {
      throw new Error(`Checksum миграции не совпадает: ${row.name}`);
    }
    if (!row.checksum) {
      db.prepare('UPDATE schema_migrations SET checksum = ? WHERE name = ?')
        .run(migration.checksum, row.name);
    }
    applied.add(row.name);
  }

  const applyMigration = db.transaction((name, sql, migrationChecksum) => {
    db.exec(sql);
    db.prepare(
      'INSERT INTO schema_migrations (name, applied_at, checksum) VALUES (?, ?, ?)',
    ).run(name, new Date().toISOString(), migrationChecksum);
  });

  for (const file of files) {
    if (applied.has(file)) continue;
    const migration = migrations.get(file);
    applyMigration(file, migration.sql, migration.checksum);
  }
};
