/**
 * GradGrid — Admissions enquiry APIs (institution-scoped)
 */

import { z } from 'zod';
import { Router } from 'express';
import httpStatus from 'http-status';
import {
  authenticate,
  loadPermissions,
  requireInstitutionScope,
  requirePermissions,
  validate,
} from '../../middleware';
import { AuthenticatedRequest } from '../../shared/types';
import { BadRequestError, NotFoundError } from '../../shared/errors';
import { prisma } from '../../config/database';

const idParams = z.object({ id: z.string().uuid() });
const createEnquirySchema = z.object({
  academicSessionId: z.string().uuid(),
  studentFirstName: z.string().min(1).max(100),
  studentLastName: z.string().min(1).max(100),
  parentName: z.string().min(1).max(200),
  parentPhone: z.string().min(5).max(20),
  parentEmail: z.string().email().optional(),
  applyingForClass: z.string().max(50).optional(),
  source: z.string().max(20).optional(),
});

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'visit_scheduled', 'approved', 'rejected', 'converted', 'withdrawn']),
  reason: z.string().max(500).optional(),
});

const router = Router();
router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/', requirePermissions('admissions.view'), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const enquiries = await prisma.admission_enquiries.findMany({
      where: { institution_id: institutionId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        enquiries: enquiries.map((e) => ({
          id: e.id,
          status: e.status,
          source: e.source,
          studentName: `${e.student_first_name} ${e.student_last_name}`.trim(),
          parentName: e.parent_name,
          parentPhone: e.parent_phone,
          parentEmail: e.parent_email,
          applyingForClass: e.applying_for_class,
          academicSessionId: e.academic_session_id,
          convertedStudentId: e.converted_student_id,
          createdAt: e.created_at,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermissions('admissions.create'), validate({ body: createEnquirySchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const body = req.body as z.infer<typeof createEnquirySchema>;
    const enquiry = await prisma.admission_enquiries.create({
      data: {
        institution_id: institutionId,
        academic_session_id: body.academicSessionId,
        student_first_name: body.studentFirstName.trim(),
        student_last_name: body.studentLastName.trim(),
        parent_name: body.parentName.trim(),
        parent_phone: body.parentPhone.trim(),
        parent_email: body.parentEmail?.trim().toLowerCase() || null,
        applying_for_class: body.applyingForClass || null,
        source: body.source || 'walk_in',
        status: 'new',
      },
    });
    await prisma.admission_enquiry_status_logs.create({
      data: {
        enquiry_id: enquiry.id,
        from_status: null,
        to_status: 'new',
        changed_by: authReq.user.id,
      },
    });
    res.status(httpStatus.CREATED).json({ success: true, data: { enquiry: { id: enquiry.id } } });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:id/status',
  requirePermissions('admissions.update'),
  validate({ params: idParams, body: statusSchema }),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const institutionId = authReq.user.institutionId!;
      const enquiry = await prisma.admission_enquiries.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      });
      if (!enquiry) throw new NotFoundError('Enquiry');
      if (enquiry.status === 'converted') {
        throw new BadRequestError('Converted enquiries cannot change status');
      }
      await prisma.admission_enquiries.update({
        where: { id: enquiry.id },
        data: { status: req.body.status, updated_at: new Date() },
      });
      await prisma.admission_enquiry_status_logs.create({
        data: {
          enquiry_id: enquiry.id,
          from_status: enquiry.status,
          to_status: req.body.status,
          changed_by: authReq.user.id,
          reason: req.body.reason || null,
        },
      });
      res.status(httpStatus.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/convert',
  requirePermissions('admissions.convert'),
  validate({
    params: idParams,
    body: z.object({ admissionNumber: z.string().min(1).max(50) }),
  }),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const institutionId = authReq.user.institutionId!;
      const enquiry = await prisma.admission_enquiries.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      });
      if (!enquiry) throw new NotFoundError('Enquiry');
      if (enquiry.converted_student_id) {
        throw new BadRequestError('Enquiry already converted');
      }

      const result = await prisma.$transaction(async (tx) => {
        const student = await tx.students.create({
          data: {
            institution_id: institutionId,
            academic_session_id: enquiry.academic_session_id,
            first_name: enquiry.student_first_name,
            last_name: enquiry.student_last_name,
            admission_number: req.body.admissionNumber.trim(),
            date_of_birth: enquiry.date_of_birth,
            email: enquiry.parent_email,
            phone: enquiry.parent_phone,
            status: 'active',
            admitted_class: enquiry.applying_for_class,
          },
        });

        const nameParts = enquiry.parent_name.trim().split(/\s+/);
        const parent = await tx.parents.create({
          data: {
            institution_id: institutionId,
            first_name: nameParts[0] || enquiry.parent_name,
            last_name: nameParts.slice(1).join(' ') || 'Guardian',
            relation: 'guardian',
            phone: enquiry.parent_phone,
            email: enquiry.parent_email,
          },
        });

        await tx.student_parent_links.create({
          data: {
            student_id: student.id,
            parent_id: parent.id,
            is_primary: true,
          },
        });

        await tx.admission_enquiries.update({
          where: { id: enquiry.id },
          data: {
            status: 'converted',
            converted_student_id: student.id,
            updated_at: new Date(),
          },
        });

        await tx.admission_enquiry_status_logs.create({
          data: {
            enquiry_id: enquiry.id,
            from_status: enquiry.status,
            to_status: 'converted',
            changed_by: authReq.user.id,
            reason: 'Converted to student',
          },
        });

        return { studentId: student.id, parentId: parent.id };
      });

      res.status(httpStatus.CREATED).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
