import { randomUUID } from 'node:crypto';
import {
  conflict,
  notFound,
  unauthorized,
} from '../utils/ApiError.js';
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from '../utils/credentials.js';

export const createUsersService = ({
  db,
  usersRepository,
  sessionsRepository,
  resumesRepository,
  vacanciesRepository,
  applicationsRepository,
}) => {
  const requireUser = (id) => {
    const user = usersRepository.findById(id);
    if (!user) throw notFound('Пользователь не найден');
    return user;
  };

  const dependencyCounts = (userId) => ({
    resumes: resumesRepository.countByOwner(userId),
    vacancies: vacanciesRepository.countByEmployer(userId),
    applications: applicationsRepository.countByCandidate(userId),
  });

  const assertNoDomainDependencies = (userId, action) => {
    const dependencies = dependencyCounts(userId);
    if (Object.values(dependencies).some((count) => count > 0)) {
      throw conflict(
        `Нельзя ${action} пользователя, пока у него есть связанные данные`,
        dependencies,
      );
    }
  };

  const assertEmailAvailable = (email, excludedUserId = null) => {
    const existing = usersRepository.findAuthByEmail(email);
    if (existing && existing.id !== excludedUserId) {
      throw conflict('Пользователь с таким email уже существует');
    }
  };

  return {
    list(pagination) {
      return usersRepository.list(pagination);
    },

    getById(id) {
      return requireUser(id);
    },

    async create({ email, password, name, role }) {
      const normalizedEmail = normalizeEmail(email);
      assertEmailAvailable(normalizedEmail);
      const passwordHash = await hashPassword(password);
      const now = new Date().toISOString();
      return usersRepository.create({
        id: randomUUID(),
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role,
        createdAt: now,
        updatedAt: now,
      });
    },

    update(id, changes) {
      requireUser(id);
      const normalizedChanges = { ...changes };
      if (changes.email !== undefined) {
        normalizedChanges.email = normalizeEmail(changes.email);
        assertEmailAvailable(normalizedChanges.email, id);
      }
      if (changes.name !== undefined) normalizedChanges.name = changes.name.trim();
      return usersRepository.update(id, normalizedChanges);
    },

    changeRole(id, role) {
      const changeRoleAndRevokeSessions = db.transaction(() => {
        const user = requireUser(id);
        if (user.role === role) return user;
        if (user.role === 'ADMIN' && usersRepository.countByRole('ADMIN') <= 1) {
          throw conflict('Нельзя понизить последнего администратора');
        }
        assertNoDomainDependencies(id, 'изменить роль');
        const updated = usersRepository.updateRole(id, role);
        sessionsRepository.deleteForUser(id);
        return updated;
      });
      return changeRoleAndRevokeSessions();
    },

    delete(id, actorId) {
      const deleteUser = db.transaction(() => {
        const user = requireUser(id);
        if (id === actorId) {
          throw conflict('Администратор не может удалить собственную учётную запись');
        }
        if (user.role === 'ADMIN' && usersRepository.countByRole('ADMIN') <= 1) {
          throw conflict('Нельзя удалить последнего администратора');
        }
        assertNoDomainDependencies(id, 'удалить');
        sessionsRepository.deleteForUser(id);
        usersRepository.delete(id);
      });
      deleteUser();
    },

    async changePassword(id, { currentPassword, newPassword }) {
      const authUser = usersRepository.findAuthById(id);
      if (!authUser) throw notFound('Пользователь не найден');
      if (!await verifyPassword(currentPassword, authUser.password_hash)) {
        throw unauthorized('Текущий пароль указан неверно');
      }
      if (currentPassword === newPassword) {
        throw conflict('Новый пароль должен отличаться от текущего');
      }

      const passwordHash = await hashPassword(newPassword);
      const updatePasswordAndRevokeSessions = db.transaction(() => {
        const user = usersRepository.update(id, { passwordHash });
        sessionsRepository.deleteForUser(id);
        return user;
      });
      return updatePasswordAndRevokeSessions();
    },
  };
};
