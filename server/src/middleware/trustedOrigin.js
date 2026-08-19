import { forbidden } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const createTrustedOriginMiddleware = (config) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method) || !req.auth?.user) {
    next();
    return;
  }

  const origin = req.get('origin');
  if (origin && origin !== config.clientOrigin) {
    next(forbidden('Источник запроса не разрешён'));
    return;
  }

  next();
};
