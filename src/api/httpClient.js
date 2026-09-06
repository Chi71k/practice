import { ApiError } from './ApiError';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const isFormData = (body) => typeof FormData !== 'undefined' && body instanceof FormData;

const buildUrl = (endpoint) => (endpoint.startsWith('http') ? endpoint : `${DEFAULT_BASE_URL}${endpoint}`);

const unwrap = (payload) => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return { data: payload.data, meta: payload.meta };
  }
  return { data: payload, meta: undefined };
};

const performRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET', headers = {}, body, token, signal, credentials = 'include',
  } = options;

  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body !== undefined && !isFormData(body)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(endpoint), {
    method,
    headers: finalHeaders,
    body: finalBody,
    signal,
    credentials,
  });

  const contentType = response.headers.get('content-type') || '';

  let payload;
  if (response.status === 204) {
    payload = undefined;
  } else if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = (payload && typeof payload === 'object' && (payload.error?.message || payload.message))
      || `Запрос завершился ошибкой ${response.status}`;
    throw new ApiError(message, { status: response.status, data: payload });
  }

  const { data, meta } = unwrap(payload);
  return {
    data, meta, status: response.status, contentType,
  };
};

export const request = async (endpoint, options) => {
  const { data } = await performRequest(endpoint, options);
  return data;
};

export const requestWithMeta = (endpoint, options) => performRequest(endpoint, options);
