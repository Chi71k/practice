import { Router } from 'express';
import { asyncHandler } from '../utils/http.js';
import { requireJson, validate } from '../middleware/validate.js';
import {
  adminCreateUserSchema,
  adminUpdateUserSchema,
  idParamsSchema,
  paginationQuerySchema,
  updateUserRoleSchema,
} from '../schemas/index.js';

export const createAdminRoutes = ({ controller, allowRoles }) => {
  const router = Router();
  router.use(allowRoles('ADMIN'));

  router.get(
    '/users',
    validate({ query: paginationQuerySchema }),
    asyncHandler(controller.listUsers),
  );
  router.post(
    '/users',
    requireJson,
    validate({ body: adminCreateUserSchema }),
    asyncHandler(controller.createUser),
  );
  router.get(
    '/users/:id',
    validate({ params: idParamsSchema }),
    asyncHandler(controller.getUser),
  );
  router.patch(
    '/users/:id',
    requireJson,
    validate({ params: idParamsSchema, body: adminUpdateUserSchema }),
    asyncHandler(controller.updateUser),
  );
  router.patch(
    '/users/:id/role',
    requireJson,
    validate({ params: idParamsSchema, body: updateUserRoleSchema }),
    asyncHandler(controller.updateRole),
  );
  router.delete(
    '/users/:id',
    validate({ params: idParamsSchema }),
    asyncHandler(controller.deleteUser),
  );

  return router;
};
