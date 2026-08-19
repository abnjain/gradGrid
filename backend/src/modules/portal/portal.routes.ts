/**
 * GradGrid — Portal learner routes
 */

import { Router, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { authenticate } from '../../middleware';
import { AuthenticatedRequest } from '../../shared/types';
import { ForbiddenError } from '../../shared/errors';
import { portalService } from './portal.service';

const router = Router();

function requirePortalUser(req: AuthenticatedRequest) {
  if (req.user.userType !== 'student' && req.user.userType !== 'parent') {
    throw new ForbiddenError('Portal routes are only for students and parents');
  }
  if (req.user.audience && req.user.audience !== 'portal') {
    throw new ForbiddenError('Invalid portal audience');
  }
}

router.use(authenticate);

router.get('/me', async (req, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    requirePortalUser(authReq);
    const data = await portalService.getHome(
      authReq.user.id,
      authReq.user.userType,
      authReq.user.institutionId
    );
    res.status(httpStatus.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/me/student', async (req, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.userType !== 'student') {
      throw new ForbiddenError('Only students can access this endpoint');
    }
    const student = await portalService.getStudentSelf(
      authReq.user.id,
      authReq.user.institutionId
    );
    res.status(httpStatus.OK).json({ success: true, data: { student } });
  } catch (error) {
    next(error);
  }
});

router.get('/me/id-card', async (req, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.userType !== 'student') {
      throw new ForbiddenError('Only students can view their ID card');
    }
    const idCard = await portalService.getStudentIdCard(
      authReq.user.id,
      authReq.user.institutionId
    );
    res.status(httpStatus.OK).json({ success: true, data: { idCard } });
  } catch (error) {
    next(error);
  }
});

router.get('/me/children', async (req, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (authReq.user.userType !== 'parent') {
      throw new ForbiddenError('Only parents can view linked children');
    }
    const data = await portalService.getParentChildren(
      authReq.user.id,
      authReq.user.institutionId
    );
    res.status(httpStatus.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
