/**
 * GradGrid — Attendance Module
 *
 * Attendance sessions, student records, and teacher records.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// POST /api/v1/attendance/sessions — create attendance session
// GET /api/v1/attendance/sessions — list sessions
// GET /api/v1/attendance/sessions/:id — get session with records
// PATCH /api/v1/attendance/sessions/:id — update session

// POST /api/v1/attendance/records — mark student attendance
// PUT /api/v1/attendance/records/:id — update attendance record
// GET /api/v1/attendance/records — query attendance records
// GET /api/v1/attendance/records/summary — attendance summary

// POST /api/v1/attendance/teacher-records — mark teacher attendance

export default router;
