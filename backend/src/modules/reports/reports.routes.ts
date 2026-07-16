/**
 * GradGrid — Reports Module
 *
 * Reporting, analytics, data export.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/reports/academic — academic performance reports
// GET /api/v1/reports/attendance — attendance reports
// GET /api/v1/reports/finance — financial reports
// GET /api/v1/reports/student — student listing / directory reports
// GET /api/v1/reports/staff — staff reports
// GET /api/v1/reports/custom — run custom report

export default router;
