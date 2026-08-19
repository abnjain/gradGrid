/**
 * GradGrid — Routes Barrel
 *
 * Aggregates all module routes under /api/v1.
 */

import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes';
import authRoutes from '../modules/auth/auth.routes';
import platformRoutes from '../modules/platform/platform.routes';
import institutionRoutes from '../modules/institution/institution.routes';
import studentRoutes from '../modules/student/student.routes';
import academicRoutes from '../modules/academic/academic.routes';
import attendanceRoutes from '../modules/attendance/attendance.routes';
import examinationRoutes from '../modules/examination/examination.routes';
import financeRoutes from '../modules/finance/finance.routes';
import communicationRoutes from '../modules/communication/communication.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import seoRoutes from '../modules/seo/seo.routes';
import rbacRoutes from '../modules/rbac/rbac.routes';

const router = Router();

/**
 * Module routes
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/platform', platformRoutes);
router.use('/institutions', institutionRoutes);
router.use('/students', studentRoutes);
router.use('/academic', academicRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examinationRoutes);
router.use('/finance', financeRoutes);
router.use('/communication', communicationRoutes);
router.use('/reports', reportsRoutes);
router.use('/seo', seoRoutes);
router.use(rbacRoutes);

export default router;
