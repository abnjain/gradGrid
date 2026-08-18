/**
 * GradGrid — Platform Module
 *
 * Super-admin platform management: tenants, signup approvals, global configuration.
 */

import { Router, Request, Response } from 'express';
import httpStatus from 'http-status';
import { authenticate, requirePlatformUser, validate } from '../../middleware';
import { SignupRequestController } from './signup-request.controller';
import {
  signupRequestParamsSchema,
  rejectSignupSchema,
} from '../auth/auth.schema';

const router = Router();
const signupController = new SignupRequestController();

router.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
  });
});

router.use(authenticate);
router.use(requirePlatformUser);

router.get('/signup-requests', signupController.list.bind(signupController));
router.get(
  '/signup-requests/:id',
  validate({ params: signupRequestParamsSchema }),
  signupController.getById.bind(signupController)
);
router.post(
  '/signup-requests/:id/approve',
  validate({ params: signupRequestParamsSchema }),
  signupController.approve.bind(signupController)
);
router.post(
  '/signup-requests/:id/reject',
  validate({ params: signupRequestParamsSchema, body: rejectSignupSchema }),
  signupController.reject.bind(signupController)
);

export default router;
