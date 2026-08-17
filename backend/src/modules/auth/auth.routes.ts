/**
 * GradGrid — Auth Routes
 *
 * Route definitions for authentication endpoints.
 * All auth routes are public (no authentication required) except /me and /logout.
 */

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  sessionParamsSchema,
} from './auth.schema';

const router = Router();
const controller = new AuthController();

// Public routes
router.post('/login', validate({ body: loginSchema }), controller.login);
router.post('/register', validate({ body: registerSchema }), controller.register);
router.post('/refresh', validate({ body: refreshTokenSchema }), controller.refresh);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), controller.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), controller.resetPassword);

// Protected routes
router.get('/me', authenticate, controller.me);
router.post('/logout', authenticate, controller.logout);
router.patch('/profile', authenticate, validate({ body: updateProfileSchema }), controller.updateProfile);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), controller.changePassword);
router.get('/sessions', authenticate, controller.listSessions);
router.delete('/sessions/:sessionId', authenticate, validate({ params: sessionParamsSchema }), controller.revokeSession);

export default router;
