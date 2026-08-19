import { randomUUID } from 'node:crypto';
import {
  conflict,
  forbidden,
  notFound,
} from '../utils/ApiError.js';
import {
  paginationMeta,
  parsePagination,
  sendData,
} from '../utils/http.js';

const canReadApplication = (user, application) => (
  user.role === 'ADMIN'
  || user.id === application.candidateId
  || (user.role === 'EMPLOYER' && user.id === application.employerId)
);

export const createApplicationsController = ({
  applicationsRepository,
  resumesRepository,
  vacanciesRepository,
}) => ({
  create(req, res) {
    if (req.auth.user.role !== 'CANDIDATE') {
      throw forbidden('Откликаться на вакансии может только кандидат');
    }

    const vacancy = vacanciesRepository.findById(req.body.vacancyId);
    if (!vacancy || vacancy.status !== 'PUBLISHED') {
      throw notFound('Опубликованная вакансия не найдена');
    }
    const resume = resumesRepository.findById(req.body.resumeId);
    if (!resume) throw notFound('Резюме не найдено');
    if (resume.ownerId !== req.auth.user.id) {
      throw notFound('Резюме не найдено');
    }
    if (applicationsRepository.findByCandidateAndVacancy(
      req.auth.user.id,
      vacancy.id,
    )) {
      throw conflict('Вы уже откликались на эту вакансию');
    }

    const now = new Date().toISOString();
    const application = applicationsRepository.create({
      id: randomUUID(),
      vacancyId: vacancy.id,
      candidateId: req.auth.user.id,
      resumeId: resume.id,
      coverLetter: req.body.coverLetter ?? '',
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    });
    sendData(res, application, { status: 201 });
  },

  list(req, res) {
    const pagination = parsePagination(req.validatedQuery ?? req.query);
    let result;
    if (req.auth.user.role === 'CANDIDATE') {
      result = applicationsRepository.listForCandidate(req.auth.user.id, pagination);
    } else if (req.auth.user.role === 'EMPLOYER') {
      result = applicationsRepository.listForEmployer(req.auth.user.id, pagination);
    } else {
      result = applicationsRepository.listAll(pagination);
    }
    sendData(res, result.items, {
      meta: paginationMeta({ ...pagination, total: result.total }),
    });
  },

  getById(req, res) {
    const application = applicationsRepository.findById(req.params.id);
    if (!application) throw notFound('Отклик не найден');
    if (!canReadApplication(req.auth.user, application)) throw notFound('Отклик не найден');
    sendData(res, application);
  },

  updateStatus(req, res) {
    const application = applicationsRepository.findById(req.params.id);
    if (!application) throw notFound('Отклик не найден');
    const canManage = req.auth.user.role === 'ADMIN'
      || (
        req.auth.user.role === 'EMPLOYER'
        && req.auth.user.id === application.employerId
      );
    if (!canManage) {
      throw notFound('Отклик не найден');
    }
    if (['WITHDRAWN', 'REJECTED', 'ACCEPTED'].includes(application.status)) {
      throw conflict('Нельзя изменить финальный статус отклика');
    }
    sendData(res, applicationsRepository.updateStatus(
      application.id,
      req.body.status,
    ));
  },

  withdraw(req, res) {
    const application = applicationsRepository.findById(req.params.id);
    if (!application) throw notFound('Отклик не найден');
    if (req.auth.user.id !== application.candidateId) {
      throw notFound('Отклик не найден');
    }
    if (!['SUBMITTED', 'REVIEWING'].includes(application.status)) {
      throw conflict('Этот отклик уже нельзя отозвать');
    }
    sendData(res, applicationsRepository.updateStatus(application.id, 'WITHDRAWN'));
  },

  delete(req, res) {
    const application = applicationsRepository.findById(req.params.id);
    if (!application) throw notFound('Отклик не найден');
    applicationsRepository.delete(application.id);
    sendData(res, null);
  },
});
