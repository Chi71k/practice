import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { requireJson, validate } from '../middleware/validate.js';
import {
  createApplicationSchema,
  idParamsSchema,
  paginationQuerySchema,
  updateApplicationStatusSchema,
} from '../schemas/index.js';

export const createApplicationsRoutes = ({
  controller,
  requireAuth,
  allowRoles,
}) => {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    validate({ query: paginationQuerySchema }),
    asyncHandler(controller.list),
  );
  router.get(
    '/:id',
    validate({ params: idParamsSchema }),
    asyncHandler(controller.getById),
  );
  router.post(
    '/',
    allowRoles('CANDIDATE'),
    requireJson,
    validate({ body: createApplicationSchema }),
    asyncHandler(controller.create),
  );
  router.patch(
    '/:id/status',
    allowRoles('EMPLOYER', 'ADMIN'),
    requireJson,
    validate({ params: idParamsSchema, body: updateApplicationStatusSchema }),
    asyncHandler(controller.updateStatus),
  );
  router.post(
    '/:id/withdraw',
    allowRoles('CANDIDATE'),
    requireJson,
    validate({ params: idParamsSchema }),
    asyncHandler(controller.withdraw),
  );
  router.delete(
    '/:id',
    allowRoles('ADMIN'),
    validate({ params: idParamsSchema }),
    asyncHandler(controller.delete),
  );

  return router;
};
