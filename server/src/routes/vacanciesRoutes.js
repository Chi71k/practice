import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { requireJson, validate } from '../middleware/validate.js';
import {
  createVacancySchema,
  idParamsSchema,
  updateVacancySchema,
  vacancyListQuerySchema,
} from '../schemas/index.js';

export const createVacanciesRoutes = ({ controller, requireAuth }) => {
  const router = Router();

  router.get('/', validate({ query: vacancyListQuerySchema }), asyncHandler(controller.list));
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
    validate({ body: createVacancySchema }),
    asyncHandler(controller.create),
  );
  router.patch(
    '/:id',
    requireAuth,
    requireJson,
    validate({ params: idParamsSchema, body: updateVacancySchema }),
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
