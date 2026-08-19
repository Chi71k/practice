import { randomUUID } from 'node:crypto';
import { assertOwnerOrAdmin } from '../services/permissions.js';
import { forbidden, notFound } from '../utils/ApiError.js';
import {
  paginationMeta,
  parsePagination,
  sendData,
} from '../utils/http.js';

export const createResumesController = ({ resumesRepository }) => ({
  list(req, res) {
    const query = req.validatedQuery ?? req.query;
    const pagination = parsePagination(query);
    const result = resumesRepository.listPublished({
      ...pagination,
      search: query.search,
      city: query.city,
    });
    sendData(res, result.items, {
      meta: paginationMeta({ ...pagination, total: result.total }),
    });
  },

  listMine(req, res) {
    if (req.auth.user.role !== 'CANDIDATE') {
      throw forbidden('Список собственных резюме доступен кандидату');
    }
    sendData(res, resumesRepository.listByOwner(req.auth.user.id));
  },

  getById(req, res) {
    const resume = resumesRepository.findById(req.params.id);
    if (!resume) throw notFound('Резюме не найдено');

    const canReadDraft = req.auth.user && (
      req.auth.user.role === 'ADMIN' || req.auth.user.id === resume.ownerId
    );
    if (!resume.isPublished && !canReadDraft) {
      throw notFound('Резюме не найдено');
    }
    sendData(res, resume);
  },

  create(req, res) {
    if (req.auth.user.role !== 'CANDIDATE') {
      throw forbidden('Создавать резюме может только кандидат');
    }
    const now = new Date().toISOString();
    const resume = resumesRepository.create({
      id: randomUUID(),
      ownerId: req.auth.user.id,
      ...req.body,
      salary: req.body.salary ?? null,
      skills: req.body.skills ?? [],
      isPublished: req.body.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    });
    sendData(res, resume, { status: 201 });
  },

  update(req, res) {
    const existing = resumesRepository.findById(req.params.id);
    if (!existing) throw notFound('Резюме не найдено');
    assertOwnerOrAdmin(req.auth.user, existing.ownerId, 'Резюме не найдено');
    sendData(res, resumesRepository.update(existing.id, req.body));
  },

  delete(req, res) {
    const existing = resumesRepository.findById(req.params.id);
    if (!existing) throw notFound('Резюме не найдено');
    assertOwnerOrAdmin(req.auth.user, existing.ownerId, 'Резюме не найдено');
    resumesRepository.delete(existing.id);
    sendData(res, null);
  },
});
