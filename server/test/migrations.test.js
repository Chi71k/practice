import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { openDatabase } from '../src/db/database.js';
import { runMigrations } from '../src/db/migrate.js';

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('migration integrity', () => {
  it('is idempotent and rejects a modified applied migration', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'practice-migrations-'));
    temporaryDirectories.push(directory);
    const migrationPath = path.join(directory, '001_test.sql');
    fs.writeFileSync(migrationPath, 'CREATE TABLE example (id TEXT PRIMARY KEY);');
    const db = openDatabase(':memory:');

    try {
      runMigrations(db, { migrationsDirectory: directory });
      runMigrations(db, { migrationsDirectory: directory });
      expect(db.prepare('SELECT COUNT(*) total FROM schema_migrations').get().total).toBe(1);
      expect(db.prepare('SELECT checksum FROM schema_migrations').get().checksum)
        .toMatch(/^[a-f0-9]{64}$/);

      fs.writeFileSync(migrationPath, 'CREATE TABLE example (id TEXT PRIMARY KEY, name TEXT);');
      expect(() => runMigrations(db, { migrationsDirectory: directory }))
        .toThrow('Checksum миграции не совпадает');
    } finally {
      db.close();
    }
  });

  it('backfills checksums for the legacy migration metadata table', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'practice-migrations-'));
    temporaryDirectories.push(directory);
    fs.writeFileSync(
      path.join(directory, '001_test.sql'),
      'CREATE TABLE example (id TEXT PRIMARY KEY);',
    );
    const db = openDatabase(':memory:');

    try {
      db.exec(`
        CREATE TABLE example (id TEXT PRIMARY KEY);
        CREATE TABLE schema_migrations (
          name TEXT PRIMARY KEY,
          applied_at TEXT NOT NULL
        );
        INSERT INTO schema_migrations (name, applied_at)
        VALUES ('001_test.sql', '2026-01-01T00:00:00.000Z');
      `);

      runMigrations(db, { migrationsDirectory: directory });
      expect(db.prepare('SELECT checksum FROM schema_migrations').get().checksum)
        .toMatch(/^[a-f0-9]{64}$/);
    } finally {
      db.close();
    }
  });
});
