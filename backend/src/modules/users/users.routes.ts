/**
 * GradGrid — Institution-scoped user routes
 */

import { Router } from 'express';
import {
  authenticate,
  loadPermissions,
  requireInstitutionScope,
  requirePermissions,
  validate,
} from '../../middleware';
import { AuthenticatedRequest } from '../../shared/types';
import { UsersController } from './users.controller';
import {
  assignRoleSchema,
  inviteInstitutionUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from './users.schema';

const router = Router();
const controller = new UsersController();

router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/', requirePermissions('users.view'), (req, res, next) =>
  controller.listInstitution(req as AuthenticatedRequest, res, next)
);

router.post(
  '/invite',
  requirePermissions('users.invite'),
  validate({ body: inviteInstitutionUserSchema }),
  (req, res, next) => controller.inviteInstitution(req as AuthenticatedRequest, res, next)
);

router.patch(
  '/:id/status',
  requirePermissions('users.deactivate'),
  validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
  (req, res, next) => controller.setInstitutionActive(req as AuthenticatedRequest, res, next)
);

router.patch(
  '/:id/role',
  requirePermissions('roles.assign'),
  validate({ params: userIdParamsSchema, body: assignRoleSchema }),
  (req, res, next) => controller.assignInstitutionRole(req as AuthenticatedRequest, res, next)
);

export default router;
