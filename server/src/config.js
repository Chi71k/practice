import 'dotenv/config';
import path from 'node:path';

const parsePositiveInteger = (value, fallback) => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const loadConfig = (overrides = {}) => {
  const nodeEnv = overrides.nodeEnv ?? process.env.NODE_ENV ?? 'development';

  return {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    host: overrides.host ?? process.env.HOST ?? '127.0.0.1',
    port: overrides.port ?? parsePositiveInteger(process.env.PORT, 3001),
    clientOrigin: overrides.clientOrigin ?? process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    databasePath: overrides.databasePath
      ?? path.resolve(process.cwd(), process.env.DATABASE_PATH ?? './data/practice.sqlite'),
    sessionTtlMs: overrides.sessionTtlMs
      ?? parsePositiveInteger(process.env.SESSION_TTL_HOURS, 168) * 60 * 60 * 1000,
  };
};
