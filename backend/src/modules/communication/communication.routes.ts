/**
 * GradGrid — Communication Module
 *
 * Notifications, announcements, communication logs, and document templates.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/communication/notifications — list notifications
// POST /api/v1/communication/notifications — create notification
// PUT /api/v1/communication/notifications/:id/read — mark as read
// DELETE /api/v1/communication/notifications/:id — delete notification

// GET /api/v1/communication/announcements — list announcements
// POST /api/v1/communication/announcements — create announcement
// PUT /api/v1/communication/announcements/:id — update announcement
// DELETE /api/v1/communication/announcements/:id — delete announcement

// GET /api/v1/communication/email-logs — list email communication logs
// GET /api/v1/communication/sms-logs — list SMS logs

// GET /api/v1/communication/templates — list document templates
// POST /api/v1/communication/templates — create template
// PUT /api/v1/communication/templates/:id — update template

export default router;
