import { request } from './httpClient';

export const register = (payload, options = {}) => request('/auth/register', {
  method: 'POST',
  body: payload,
  signal: options.signal,
});

export const login = ({ email, password }, options = {}) => request('/auth/login', {
  method: 'POST',
  body: { email, password },
  signal: options.signal,
});

export const getCurrentUser = (options = {}) => request('/auth/me', {
  method: 'GET',
  signal: options.signal,
});

export const updateMe = (payload, options = {}) => request('/auth/me', {
  method: 'PATCH',
  body: payload,
  signal: options.signal,
});

export const updatePassword = (payload, options = {}) => request('/auth/me/password', {
  method: 'PATCH',
  body: payload,
  signal: options.signal,
});

export const logout = (options = {}) => request('/auth/logout', {
  method: 'POST',
  body: {},
  signal: options.signal,
});
