import { request, requestWithMeta } from './httpClient';
import { toQueryString } from '../utils/queryString';

export const getResumes = (query = {}, options = {}) => requestWithMeta(`/resumes${toQueryString(query)}`, {
  method: 'GET',
  signal: options.signal,
});

export const getResumeById = (id, options = {}) => request(`/resumes/${id}`, {
  method: 'GET',
  signal: options.signal,
});

export const getMyResumes = (options = {}) => request('/resumes/mine', {
  method: 'GET',
  signal: options.signal,
});

export const createResume = (payload, options = {}) => request('/resumes', {
  method: 'POST',
  body: payload,
  signal: options.signal,
});

export const updateResume = (id, payload, options = {}) => request(`/resumes/${id}`, {
  method: 'PATCH',
  body: payload,
  signal: options.signal,
});

export const deleteResume = (id, options = {}) => request(`/resumes/${id}`, {
  method: 'DELETE',
  signal: options.signal,
});
