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
import { TenantController } from './tenant.controller';
import {
  createAcademicSessionSchema,
  createInstitutionSchema,
  createOrganizationSchema,
  organizationIdParamsSchema,
  updateInstitutionSchema,
  updateOrganizationSchema,
} from './tenant.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { UsersController } from '../users/users.controller';
import {
  invitePlatformUserSchema,
  updateUserStatusSchema,
  userIdParamsSchema,
} from '../users/users.schema';

const router = Router();
const signupController = new SignupRequestController();
const rbacController = new RbacController();
const tenantController = new TenantController();
const usersController = new UsersController();

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

router.get('/organizations', requirePermissions('organization.view'), (req, res, next) =>
  tenantController.listOrganizations(req as AuthenticatedRequest, res, next)
);
router.get(
  '/organizations/:id',
  requirePermissions('organization.view'),
  validate({ params: organizationIdParamsSchema }),
  (req, res, next) => tenantController.getOrganization(req as AuthenticatedRequest, res, next)
);
router.post(
  '/organizations',
  requirePermissions('organization.manage'),
  validate({ body: createOrganizationSchema }),
  (req, res, next) => tenantController.createOrganization(req as AuthenticatedRequest, res, next)
);
router.patch(
  '/organizations/:id',
  requirePermissions('organization.manage'),
  validate({ params: organizationIdParamsSchema, body: updateOrganizationSchema }),
  (req, res, next) => tenantController.updateOrganization(req as AuthenticatedRequest, res, next)
);

router.get('/institutions', requirePermissions('institution.view'), (req, res, next) =>
  tenantController.listInstitutions(req as AuthenticatedRequest, res, next)
);
router.get(
  '/institutions/:id',
  requirePermissions('institution.view'),
  validate({ params: organizationIdParamsSchema }),
  (req, res, next) => tenantController.getInstitution(req as AuthenticatedRequest, res, next)
);
router.post(
  '/institutions',
  requirePermissions('institution.manage'),
  validate({ body: createInstitutionSchema }),
  (req, res, next) => tenantController.createInstitution(req as AuthenticatedRequest, res, next)
);
router.patch(
  '/institutions/:id',
  requirePermissions('institution.manage'),
  validate({ params: organizationIdParamsSchema, body: updateInstitutionSchema }),
  (req, res, next) => tenantController.updateInstitution(req as AuthenticatedRequest, res, next)
);
router.get(
  '/institutions/:id/academic-sessions',
  requirePermissions('institution.view'),
  validate({ params: organizationIdParamsSchema }),
  (req, res, next) => tenantController.listSessions(req as AuthenticatedRequest, res, next)
);
router.post(
  '/institutions/:id/academic-sessions',
  requirePermissions('institution.manage'),
  validate({ params: organizationIdParamsSchema, body: createAcademicSessionSchema }),
  (req, res, next) => tenantController.createSession(req as AuthenticatedRequest, res, next)
);

router.get('/users', requirePermissions('platform_users.view'), (req, res, next) =>
  usersController.listPlatform(req as AuthenticatedRequest, res, next)
);
router.post(
  '/users/invite',
  requirePermissions('platform_users.manage'),
  validate({ body: invitePlatformUserSchema }),
  (req, res, next) => usersController.invitePlatform(req as AuthenticatedRequest, res, next)
);
router.patch(
  '/users/:id/status',
  requirePermissions('platform_users.manage'),
  validate({ params: userIdParamsSchema, body: updateUserStatusSchema }),
  (req, res, next) => usersController.setPlatformActive(req as AuthenticatedRequest, res, next)
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
