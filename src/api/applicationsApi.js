import { request, requestWithMeta } from './httpClient';
import { toQueryString } from '../utils/queryString';

export const getApplications = (query = {}, options = {}) => requestWithMeta(`/applications${toQueryString(query)}`, {
  method: 'GET',
  signal: options.signal,
});

export const getApplicationById = (id, options = {}) => request(`/applications/${id}`, {
  method: 'GET',
  signal: options.signal,
});

export const createApplication = (payload, options = {}) => request('/applications', {
  method: 'POST',
  body: payload,
  signal: options.signal,
});

export const withdrawApplication = (id, options = {}) => request(`/applications/${id}/withdraw`, {
  method: 'POST',
  body: {},
  signal: options.signal,
});

export const updateApplicationStatus = (id, status, options = {}) => request(`/applications/${id}/status`, {
  method: 'PATCH',
  body: { status },
  signal: options.signal,
});

export const deleteApplication = (id, options = {}) => request(`/applications/${id}`, {
  method: 'DELETE',
  signal: options.signal,
});
