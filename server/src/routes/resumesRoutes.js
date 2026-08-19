import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { requireJson, validate } from '../middleware/validate.js';
import {
  createResumeSchema,
  idParamsSchema,
  resumeListQuerySchema,
  updateResumeSchema,
} from '../schemas/index.js';

export const createResumesRoutes = ({ controller, requireAuth }) => {
  const router = Router();

  router.get('/', validate({ query: resumeListQuerySchema }), asyncHandler(controller.list));
  router.get('/mine', requireAuth, asyncHandler(controller.listMine));
  router.get(
    '/:id',
    validate({ params: idParamsSchema }),
    asyncHandler(controller.getById),
  );
  router.post(
    '/',
    requireAuth,
    requireJson,
    validate({ body: createResumeSchema }),
    asyncHandler(controller.create),
  );
  router.patch(
    '/:id',
    requireAuth,
    requireJson,
    validate({ params: idParamsSchema, body: updateResumeSchema }),
    asyncHandler(controller.update),
  );
  router.delete(
    '/:id',
    requireAuth,
    validate({ params: idParamsSchema }),
    asyncHandler(controller.delete),
  );

  return router;
};
