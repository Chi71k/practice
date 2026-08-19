import { loadConfig } from '../config.js';
import { openDatabase } from './database.js';
import { runMigrations } from './migrate.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);

try {
  runMigrations(db);
  console.log(`Миграции применены: ${config.databasePath}`);
} finally {
  db.close();
}
