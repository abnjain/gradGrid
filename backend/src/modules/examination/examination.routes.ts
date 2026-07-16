/**
 * GradGrid — Examination Module
 *
 * Exam types, exams, mark entry, grade rules, and result computation.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/exams/types — list exam types
// POST /api/v1/exams/types — create exam type
// PUT /api/v1/exams/types/:id — update exam type

// GET /api/v1/exams — list exams
// POST /api/v1/exams — create exam
// GET /api/v1/exams/:id — get exam details
// PUT /api/v1/exams/:id — update exam
// DELETE /api/v1/exams/:id — delete exam

// GET /api/v1/exams/:examId/subjects — subjects for exam
// POST /api/v1/exams/:examId/subjects — assign subject to exam
// PUT /api/v1/exams/:examId/subjects/:subjectId — update subject details

// GET /api/v1/exams/marks — query marks
// POST /api/v1/exams/marks — enter marks
// PUT /api/v1/exams/marks/:id — update marks

// GET /api/v1/exams/grade-rules — list grade rules
// POST /api/v1/exams/grade-rules — create grade rule
// PUT /api/v1/exams/grade-rules/:id — update grade rule

export default router;
