import { notFound } from '../utils/ApiError.js';

export const assertOwnerOrAdmin = (user, ownerId, message = 'Нет доступа к ресурсу') => {
  if (user.role !== 'ADMIN' && user.id !== ownerId) {
    throw notFound(message);
  }
};

export const assertEmployerOwnsVacancyOrAdmin = (user, vacancy) => {
  if (user.role !== 'ADMIN' && (
    user.role !== 'EMPLOYER' || user.id !== vacancy.employerId
  )) {
    throw notFound('Вакансия не найдена');
  }
};
