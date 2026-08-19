import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { asyncHandler } from '../utils/http.js';
import { requireJson, validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../schemas/index.js';

export const createAuthRoutes = ({ controller, requireAuth, config }) => {
  const router = Router();
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => config.isTest,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Слишком много попыток. Повторите позже.',
      },
    },
  });

  router.post(
    '/register',
    authLimiter,
    requireJson,
    validate({ body: registerSchema }),
    asyncHandler(controller.register),
  );
  router.post(
    '/login',
    authLimiter,
    requireJson,
    validate({ body: loginSchema }),
    asyncHandler(controller.login),
  );
  router.post('/logout', requireJson, controller.logout);
  router.get('/me', requireAuth, controller.me);
  router.patch(
    '/me',
    requireAuth,
    requireJson,
    validate({ body: updateProfileSchema }),
    asyncHandler(controller.updateProfile),
  );
  router.patch(
    '/me/password',
    requireAuth,
    requireJson,
    validate({ body: changePasswordSchema }),
    asyncHandler(controller.changePassword),
  );

  return router;
};
