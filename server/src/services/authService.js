import { randomUUID } from 'node:crypto';
import { conflict, unauthorized } from '../utils/ApiError.js';
import {
  hashPassword,
  normalizeEmail,
  performDummyPasswordHash,
  verifyPassword,
} from '../utils/credentials.js';
import { createSessionToken, hashSessionToken } from '../utils/session.js';

export const createAuthService = ({
  db,
  usersRepository,
  sessionsRepository,
  config,
}) => {
  const createSession = (userId) => {
    const token = createSessionToken();
    const now = Date.now();
    sessionsRepository.create({
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt: now + config.sessionTtlMs,
      createdAt: new Date(now).toISOString(),
    });
    return token;
  };

  return {
    async register({ email, password, name, role }) {
      const normalizedEmail = normalizeEmail(email);
      if (usersRepository.findAuthByEmail(normalizedEmail)) {
        throw conflict('Пользователь с таким email уже существует');
      }

      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();
      const createUserAndSession = db.transaction(() => {
        const user = usersRepository.create({
          id: randomUUID(),
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          role,
          createdAt: now,
          updatedAt: now,
        });
        return { user, token: createSession(user.id) };
      });

      return createUserAndSession();
    },

    async login({ email, password }) {
      const authUser = usersRepository.findAuthByEmail(normalizeEmail(email));
      const passwordMatches = authUser
        ? await verifyPassword(password, authUser.password_hash)
        : false;

      if (!authUser) {
        // Выполняем сопоставимую дорогую операцию, чтобы не раскрывать наличие email по времени ответа.
        await performDummyPasswordHash(password);
      }

      if (!authUser || !passwordMatches) {
        throw unauthorized('Неверный email или пароль');
      }

      return {
        user: usersRepository.findById(authUser.id),
        token: createSession(authUser.id),
      };
    },

    authenticate(token) {
      if (!token) return null;
      sessionsRepository.deleteExpired();
      const session = sessionsRepository.findUserByTokenHash(hashSessionToken(token));
      if (!session) return null;

      if (session.expiresAt <= Date.now()) {
        sessionsRepository.deleteByTokenHash(session.tokenHash);
        return null;
      }
      return session.user;
    },

    logout(token) {
      if (!token) return;
      sessionsRepository.deleteByTokenHash(hashSessionToken(token));
    },
  };
};
