/**
 * GradGrid — Institution Module
 *
 * Institution-scoped configuration endpoints.
 * Platform CRUD for institutions lives under /platform/institutions.
 */

import { Router, Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  authenticate,
  loadPermissions,
  requireInstitutionScope,
  requirePermissions,
} from '../../middleware';
import { AuthenticatedRequest } from '../../shared/types';
import { BadRequestError } from '../../shared/errors';
import { tenantService } from '../platform/tenant.service';

const router = Router();

router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/me', requirePermissions('institution.view'), async (req: Request, res: Response, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user.institutionId) {
      throw new BadRequestError('Select an institution context first');
    }
    const institution = await tenantService.getInstitution(authReq.user.institutionId);
    res.status(httpStatus.OK).json({ success: true, data: { institution } });
  } catch (error) {
    next(error);
  }
});

// Protected routes
// router.use(authenticate);
// GET /api/v1/institutions/:id — institution details
// PATCH /api/v1/institutions/:id — update institution config
// GET /api/v1/institutions/:id/departments — list departments
// POST /api/v1/institutions/:id/departments — create department
// GET /api/v1/institutions/:id/houses — list houses
// POST /api/v1/institutions/:id/houses — create house
router.get(
  '/me/academic-sessions',
  requirePermissions('institution.view'),
  async (req: Request, res: Response, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user.institutionId) {
        throw new BadRequestError('Select an institution context first');
      }
      const sessions = await tenantService.listAcademicSessions(authReq.user.institutionId);
      res.status(httpStatus.OK).json({ success: true, data: { sessions } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
