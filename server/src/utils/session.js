import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'practice_session';

export const createSessionToken = () => randomBytes(32).toString('base64url');

export const hashSessionToken = (token) => (
  createHash('sha256').update(token).digest('hex')
);

export const sessionCookieOptions = (config) => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: config.sessionTtlMs,
});

export const setSessionCookie = (res, token, config) => {
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(config));
};

export const clearSessionCookie = (res, config) => {
  const { maxAge, ...options } = sessionCookieOptions(config);
  void maxAge;
  res.clearCookie(SESSION_COOKIE_NAME, options);
};
