/**
 * GradGrid — Institution Module
 *
 * Institution registration, configuration, and lifecycle management.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

// Public routes
// POST /api/v1/institutions — register a new institution
// GET /api/v1/institutions/:slug — public institution info

// Protected routes
router.use(authenticate);
// GET /api/v1/institutions/:id — institution details
// PATCH /api/v1/institutions/:id — update institution config
// GET /api/v1/institutions/:id/departments — list departments
// POST /api/v1/institutions/:id/departments — create department
// GET /api/v1/institutions/:id/houses — list houses
// POST /api/v1/institutions/:id/houses — create house

export default router;
