/**
 * GradGrid — Platform Module
 *
 * Super-admin platform management: tenants, licenses, global configuration.
 */

import { Router, Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { authenticate, requirePermissions } from '../../middleware';

const router = Router();

// GET /api/v1/platform/health
router.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
  });
});

// All platform routes require super-admin access
router.use(authenticate);
router.use(requirePermissions('platform.manage'));

export default router;
