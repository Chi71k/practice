import { randomUUID } from 'node:crypto';
import { assertEmployerOwnsVacancyOrAdmin } from '../services/permissions.js';
import { forbidden, notFound, unprocessable } from '../utils/ApiError.js';
import {
  paginationMeta,
  parsePagination,
  sendData,
} from '../utils/http.js';

const validateSalaryRange = (vacancy) => {
  if (
    vacancy.salaryFrom != null
    && vacancy.salaryTo != null
    && vacancy.salaryFrom > vacancy.salaryTo
  ) {
    throw unprocessable('salaryFrom не может быть больше salaryTo');
  }
};

export const createVacanciesController = ({ vacanciesRepository }) => ({
  list(req, res) {
    const query = req.validatedQuery ?? req.query;
    const pagination = parsePagination(query);
    const result = vacanciesRepository.listPublished({
      ...pagination,
      search: query.search,
      city: query.city,
      employmentType: query.employmentType,
    });
    sendData(res, result.items, {
      meta: paginationMeta({ ...pagination, total: result.total }),
    });
  },

  listMine(req, res) {
    if (req.auth.user.role !== 'EMPLOYER') {
      throw forbidden('Список собственных вакансий доступен работодателю');
    }
    sendData(res, vacanciesRepository.listByEmployer(req.auth.user.id));
  },

  getById(req, res) {
    const vacancy = vacanciesRepository.findById(req.params.id);
    if (!vacancy) throw notFound('Вакансия не найдена');
    const canReadDraft = req.auth.user && (
      req.auth.user.role === 'ADMIN' || req.auth.user.id === vacancy.employerId
    );
    if (vacancy.status !== 'PUBLISHED' && !canReadDraft) {
      throw notFound('Вакансия не найдена');
    }
    sendData(res, vacancy);
  },

  create(req, res) {
    if (req.auth.user.role !== 'EMPLOYER') {
      throw forbidden('Создавать вакансии может только работодатель');
    }
    const now = new Date().toISOString();
    const vacancy = vacanciesRepository.create({
      id: randomUUID(),
      employerId: req.auth.user.id,
      ...req.body,
      salaryFrom: req.body.salaryFrom ?? null,
      salaryTo: req.body.salaryTo ?? null,
      skills: req.body.skills ?? [],
      status: req.body.status ?? 'DRAFT',
      createdAt: now,
      updatedAt: now,
    });
    sendData(res, vacancy, { status: 201 });
  },

  update(req, res) {
    const existing = vacanciesRepository.findById(req.params.id);
    if (!existing) throw notFound('Вакансия не найдена');
    assertEmployerOwnsVacancyOrAdmin(req.auth.user, existing);
    validateSalaryRange({ ...existing, ...req.body });
    sendData(res, vacanciesRepository.update(existing.id, req.body));
  },

  delete(req, res) {
    const existing = vacanciesRepository.findById(req.params.id);
    if (!existing) throw notFound('Вакансия не найдена');
    assertEmployerOwnsVacancyOrAdmin(req.auth.user, existing);
    vacanciesRepository.delete(existing.id);
    sendData(res, null);
  },
});
