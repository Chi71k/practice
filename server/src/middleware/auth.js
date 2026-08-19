import { forbidden, unauthorized } from '../utils/ApiError.js';
import {
  clearSessionCookie,
  SESSION_COOKIE_NAME,
} from '../utils/session.js';

export const createAuthMiddleware = ({ authService, config }) => {
  const optionalAuth = (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    const user = authService.authenticate(token);

    req.auth = {
      user,
      sessionToken: token ?? null,
    };

    if (token && !user) {
      clearSessionCookie(res, config);
    }

    next();
  };

  const requireAuth = (req, res, next) => {
    if (!req.auth?.user) {
      next(unauthorized());
      return;
    }
    next();
  };

  const allowRoles = (...roles) => (req, res, next) => {
    if (!req.auth?.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.auth.user.role)) {
      next(forbidden());
      return;
    }
    next();
  };

  return { optionalAuth, requireAuth, allowRoles };
};
