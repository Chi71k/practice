import { request, requestWithMeta } from './httpClient';
import { toQueryString } from '../utils/queryString';

export const getUsers = (query = {}, options = {}) => requestWithMeta(`/admin/users${toQueryString(query)}`, {
  method: 'GET',
  signal: options.signal,
});

export const createUser = (payload, options = {}) => request('/admin/users', {
  method: 'POST',
  body: payload,
  signal: options.signal,
});

export const updateUserRole = (id, role, options = {}) => request(`/admin/users/${id}/role`, {
  method: 'PATCH',
  body: { role },
  signal: options.signal,
});

export const deleteUser = (id, options = {}) => request(`/admin/users/${id}`, {
  method: 'DELETE',
  signal: options.signal,
});
