/**
 * GradGrid — Student Module
 *
 * Student profiles, enrollment, parent linking, and lifecycle.
 */

import { Router, Request, Response } from 'express';
import httpStatus from 'http-status';
import { authenticate, loadPermissions, requirePermissions } from '../../middleware';

const router = Router();

router.use(authenticate, loadPermissions);

router.get('/', requirePermissions('students.view'), (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    data: { students: [] },
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
});

export default router;
