/**
 * GradGrid — Academic Module
 *
 * Classes, sections, subjects, timetables, and curriculum management.
 */

import { Router } from 'express';
import { authenticate } from '../../middleware';

const router = Router();

router.use(authenticate);
// GET /api/v1/academic/classes — list all classes
// POST /api/v1/academic/classes — create class
// PUT /api/v1/academic/classes/:id — update class
// DELETE /api/v1/academic/classes/:id — delete class

// GET /api/v1/academic/sections — list sections for a class
// POST /api/v1/academic/sections — create section
// PUT /api/v1/academic/sections/:id — update section

// GET /api/v1/academic/subjects — list subjects
// POST /api/v1/academic/subjects — create subject
// GET /api/v1/academic/section-subjects — get subjects for a section
// POST /api/v1/academic/section-subjects — assign subject to section
// DELETE /api/v1/academic/section-subjects/:id — unassign subject

// GET /api/v1/academic/enrollments — list enrollments
// POST /api/v1/academic/enrollments — enroll student
// PUT /api/v1/academic/enrollments/:id — update enrollment
// DELETE /api/v1/academic/enrollments/:id — withdraw student

export default router;
