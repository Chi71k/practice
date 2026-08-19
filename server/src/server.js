import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { openDatabase } from './db/database.js';
import { runMigrations } from './db/migrate.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);
runMigrations(db);

const app = createApp({ db, config });
const server = app.listen(config.port, config.host, () => {
  console.log(`Learning API: http://${config.host}:${config.port}/api`);
  console.log(`Allowed frontend origin: ${config.clientOrigin}`);
});

const shutdown = (signal) => {
  console.log(`\n${signal}: завершаем сервер...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
