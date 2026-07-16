/**
 * GradGrid — Student Module
 *
 * Student profiles, enrollment, parent linking, and lifecycle.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/students — list students (paginated, filterable)
// POST /api/v1/students — create student profile
// GET /api/v1/students/:id — get student details
// PATCH /api/v1/students/:id — update student profile
// DELETE /api/v1/students/:id — soft-delete student
// POST /api/v1/students/:id/parents — link parent
// DELETE /api/v1/students/:id/parents/:parentId — unlink parent

export default router;
