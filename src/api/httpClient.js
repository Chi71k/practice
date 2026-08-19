import { ApiError } from './ApiError';

const DEFAULT_BASE_URL = 'https://dummyjson.com';

const isFormData = (body) => typeof FormData !== 'undefined' && body instanceof FormData;

const buildUrl = (endpoint) => (endpoint.startsWith('http') ? endpoint : `${DEFAULT_BASE_URL}${endpoint}`);

const performRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET', headers = {}, body, token, signal, credentials,
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

  let data;
  if (response.status === 204) {
    data = undefined;
  } else if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = (data && typeof data === 'object' && data.message)
      || `Запрос завершился ошибкой ${response.status}`;
    throw new ApiError(message, { status: response.status, data });
  }

  return { data, status: response.status, contentType };
};

export const request = async (endpoint, options) => {
  const { data } = await performRequest(endpoint, options);
  return data;
};

export const requestWithMeta = (endpoint, options) => performRequest(endpoint, options);
