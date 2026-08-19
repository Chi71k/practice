import { request } from './httpClient';

export const login = ({ username, password }, options = {}) => request('/auth/login', {
  method: 'POST',
  body: { username, password, expiresInMins: 30 },
  signal: options.signal,
});

export const getCurrentUser = (accessToken, options = {}) => request('/auth/me', {
  method: 'GET',
  token: accessToken,
  signal: options.signal,
});
