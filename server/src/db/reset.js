import fs from 'node:fs';
import { loadConfig } from '../config.js';
import { openDatabase } from './database.js';
import { runMigrations } from './migrate.js';
import { seedDatabase } from './seed.js';

const config = loadConfig();

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(`${config.databasePath}${suffix}`, { force: true });
}

const db = openDatabase(config.databasePath);
try {
  runMigrations(db);
  await seedDatabase(db);
  console.log(`База пересоздана: ${config.databasePath}`);
} finally {
  db.close();
}
