/**
 * GradGrid — Platform Module
 *
 * Super-admin platform management: tenants, signup approvals, roles, global configuration.
 */

import { Router, Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  authenticate,
  loadPermissions,
  requirePlatformUser,
  requirePermissions,
  validate,
} from '../../middleware';
import { SignupRequestController } from './signup-request.controller';
import {
  signupRequestParamsSchema,
  rejectSignupSchema,
} from '../auth/auth.schema';
import { RbacController } from '../rbac/rbac.controller';
import {
  createRoleSchema,
  replacePermissionsSchema,
  roleIdParamsSchema,
  updateRoleSchema,
} from '../rbac/rbac.schema';
import { AuthenticatedRequest } from '../../shared/types';

const router = Router();
const signupController = new SignupRequestController();
const rbacController = new RbacController();

router.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
  });
});

router.use(authenticate, requirePlatformUser, loadPermissions);

router.get(
  '/signup-requests',
  requirePermissions('platform_users.view'),
  signupController.list.bind(signupController)
);
router.get(
  '/signup-requests/:id',
  requirePermissions('platform_users.view'),
  validate({ params: signupRequestParamsSchema }),
  signupController.getById.bind(signupController)
);
router.post(
  '/signup-requests/:id/approve',
  requirePermissions('platform_users.manage'),
  validate({ params: signupRequestParamsSchema }),
  signupController.approve.bind(signupController)
);
router.post(
  '/signup-requests/:id/reject',
  requirePermissions('platform_users.manage'),
  validate({ params: signupRequestParamsSchema, body: rejectSignupSchema }),
  signupController.reject.bind(signupController)
);

router.get('/permissions', requirePermissions('roles.view'), (req, res, next) =>
  rbacController.listPermissions(req as AuthenticatedRequest, res, next)
);
router.get('/roles', requirePermissions('roles.view'), (req, res, next) =>
  rbacController.listRoles(req as AuthenticatedRequest, res, next)
);
router.post(
  '/roles',
  requirePermissions('roles.create'),
  validate({ body: createRoleSchema }),
  (req, res, next) => rbacController.createRole(req as AuthenticatedRequest, res, next)
);
router.patch(
  '/roles/:id',
  requirePermissions('roles.update'),
  validate({ params: roleIdParamsSchema, body: updateRoleSchema }),
  (req, res, next) => rbacController.updateRole(req as AuthenticatedRequest, res, next)
);
router.delete(
  '/roles/:id',
  requirePermissions('roles.delete'),
  validate({ params: roleIdParamsSchema }),
  (req, res, next) => rbacController.deleteRole(req as AuthenticatedRequest, res, next)
);
router.put(
  '/roles/:id/permissions',
  requirePermissions('roles.update'),
  validate({ params: roleIdParamsSchema, body: replacePermissionsSchema }),
  (req, res, next) => rbacController.replacePermissions(req as AuthenticatedRequest, res, next)
);

export default router;
