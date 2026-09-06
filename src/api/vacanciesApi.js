import { request, requestWithMeta } from './httpClient';
import { toQueryString } from '../utils/queryString';

export const getVacancies = (query = {}, options = {}) => requestWithMeta(`/vacancies${toQueryString(query)}`, {
  method: 'GET',
  signal: options.signal,
});

export const getVacancyById = (id, options = {}) => request(`/vacancies/${id}`, {
  method: 'GET',
  signal: options.signal,
});

export const getMyVacancies = (options = {}) => request('/vacancies/mine', {
  method: 'GET',
  signal: options.signal,
});

export const createVacancy = (payload, options = {}) => request('/vacancies', {
  method: 'POST',
  body: payload,
  signal: options.signal,
});

export const updateVacancy = (id, payload, options = {}) => request(`/vacancies/${id}`, {
  method: 'PATCH',
  body: payload,
  signal: options.signal,
});

export const deleteVacancy = (id, options = {}) => request(`/vacancies/${id}`, {
  method: 'DELETE',
  signal: options.signal,
});
