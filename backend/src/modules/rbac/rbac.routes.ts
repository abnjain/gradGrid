/**
 * GradGrid — Institution RBAC routes
 */

import { Router } from 'express';
import {
  authenticate,
  loadPermissions,
  requirePermissions,
  validate,
} from '../../middleware';
import { RbacController } from './rbac.controller';
import {
  createRoleSchema,
  replacePermissionsSchema,
  roleIdParamsSchema,
  updateRoleSchema,
} from './rbac.schema';
import { AuthenticatedRequest } from '../../shared/types';

const router = Router();
const controller = new RbacController();

router.use(authenticate, loadPermissions);

router.get(
  '/permissions',
  requirePermissions('roles.view'),
  (req, res, next) => controller.listPermissions(req as AuthenticatedRequest, res, next)
);

router.get(
  '/roles',
  requirePermissions('roles.view'),
  (req, res, next) => controller.listRoles(req as AuthenticatedRequest, res, next)
);

router.post(
  '/roles',
  requirePermissions('roles.create'),
  validate({ body: createRoleSchema }),
  (req, res, next) => controller.createRole(req as AuthenticatedRequest, res, next)
);

router.patch(
  '/roles/:id',
  requirePermissions('roles.update'),
  validate({ params: roleIdParamsSchema, body: updateRoleSchema }),
  (req, res, next) => controller.updateRole(req as AuthenticatedRequest, res, next)
);

router.delete(
  '/roles/:id',
  requirePermissions('roles.delete'),
  validate({ params: roleIdParamsSchema }),
  (req, res, next) => controller.deleteRole(req as AuthenticatedRequest, res, next)
);

router.put(
  '/roles/:id/permissions',
  requirePermissions('roles.update'),
  validate({ params: roleIdParamsSchema, body: replacePermissionsSchema }),
  (req, res, next) => controller.replacePermissions(req as AuthenticatedRequest, res, next)
);

export default router;
