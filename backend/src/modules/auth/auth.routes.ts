/**
 * GradGrid — Auth Routes (audience-split)
 *
 * /auth/platform/*    — platform admins
 * /auth/institution/* — institution staff
 * /auth/portal/*      — parent / student
 * /auth/*             — temporary institution compat aliases
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  loginSchema,
  refreshTokenSchema,
  registerInstitutionSchema,
  verifyEmailSchema,
  resendOtpSchema,
  signupStatusQuerySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  sessionParamsSchema,
  selectContextSchema,
} from './auth.schema';
import { AuthAudience } from './auth-audience';

const controller = new AuthController();

function bindAudience(
  method: (
    req: Parameters<AuthController['login']>[0],
    res: Parameters<AuthController['login']>[1],
    next: Parameters<AuthController['login']>[2],
    audience: AuthAudience
  ) => void,
  audience: AuthAudience
) {
  return (
    req: Parameters<AuthController['login']>[0],
    res: Parameters<AuthController['login']>[1],
    next: Parameters<AuthController['login']>[2]
  ) => method.call(controller, req, res, next, audience);
}

function mountAudienceRoutes(router: Router, audience: AuthAudience) {
  router.post('/login', validate({ body: loginSchema }), bindAudience(controller.login, audience));
  router.post(
    '/refresh',
    validate({ body: refreshTokenSchema }),
    bindAudience(controller.refresh, audience)
  );
  router.post('/forgot-password', validate({ body: forgotPasswordSchema }), (req, res, next) =>
    controller.forgotPassword(req, res, next)
  );
  router.post('/reset-password', validate({ body: resetPasswordSchema }), (req, res, next) =>
    controller.resetPassword(req, res, next)
  );

  router.post('/logout', authenticate, (req, res, next) => controller.logout(req, res, next));
  router.get('/me', authenticate, (req, res, next) => controller.me(req, res, next));
  router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), (req, res, next) =>
    controller.updateProfile(req, res, next)
  );
  router.post(
    '/change-password',
    authenticate,
    validate({ body: changePasswordSchema }),
    (req, res, next) => controller.changePassword(req, res, next)
  );
  router.get('/sessions', authenticate, (req, res, next) => controller.listSessions(req, res, next));
  router.delete(
    '/sessions/:sessionId',
    authenticate,
    validate({ params: sessionParamsSchema }),
    (req, res, next) => controller.revokeSession(req, res, next)
  );
}

const platformRouter = Router();
mountAudienceRoutes(platformRouter, 'platform');

const institutionRouter = Router();
mountAudienceRoutes(institutionRouter, 'institution');
institutionRouter.post(
  '/register-institution',
  validate({ body: registerInstitutionSchema }),
  (req, res, next) => controller.registerInstitution(req, res, next)
);
institutionRouter.post('/verify-email', validate({ body: verifyEmailSchema }), (req, res, next) =>
  controller.verifyEmail(req, res, next)
);
institutionRouter.post('/resend-otp', validate({ body: resendOtpSchema }), (req, res, next) =>
  controller.resendOtp(req, res, next)
);
institutionRouter.get(
  '/signup-status',
  validate({ query: signupStatusQuerySchema }),
  (req, res, next) => controller.signupStatus(req, res, next)
);
institutionRouter.get('/workspaces', authenticate, (req, res, next) =>
  controller.workspaces(req, res, next)
);
institutionRouter.post(
  '/select-context',
  authenticate,
  validate({ body: selectContextSchema }),
  (req, res, next) => controller.selectContext(req, res, next)
);

const portalRouter = Router();
mountAudienceRoutes(portalRouter, 'portal');

const router = Router();
router.use('/platform', platformRouter);
router.use('/institution', institutionRouter);
router.use('/portal', portalRouter);

// Temporary compat: old /auth/* → institution audience
mountAudienceRoutes(router, 'institution');
router.post(
  '/register-institution',
  validate({ body: registerInstitutionSchema }),
  (req, res, next) => controller.registerInstitution(req, res, next)
);
router.post('/verify-email', validate({ body: verifyEmailSchema }), (req, res, next) =>
  controller.verifyEmail(req, res, next)
);
router.post('/resend-otp', validate({ body: resendOtpSchema }), (req, res, next) =>
  controller.resendOtp(req, res, next)
);
router.get('/signup-status', validate({ query: signupStatusQuerySchema }), (req, res, next) =>
  controller.signupStatus(req, res, next)
);
router.get('/workspaces', authenticate, (req, res, next) => controller.workspaces(req, res, next));
router.post(
  '/select-context',
  authenticate,
  validate({ body: selectContextSchema }),
  (req, res, next) => controller.selectContext(req, res, next)
);

export default router;
