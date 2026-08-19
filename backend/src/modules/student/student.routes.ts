/**
 * GradGrid — Student staff APIs (institution-scoped)
 */

import { z } from 'zod';
import { Router, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import {
  authenticate,
  loadPermissions,
  requireInstitutionScope,
  requirePermissions,
  validate,
} from '../../middleware';
import { AuthenticatedRequest } from '../../shared/types';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors';
import { prisma } from '../../config/database';
import { hashPassword } from '../../shared/utils/password';
import crypto from 'crypto';
import { sendEmail } from '../../shared/utils/email';
import { config } from '../../config';

const idParams = z.object({ id: z.string().uuid() });

const createStudentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  admissionNumber: z.string().min(1).max(50),
  academicSessionId: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  gender: z.string().max(10).optional(),
  rollNumber: z.string().max(20).optional(),
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  status: z.string().max(20).optional(),
});

const updateStudentSchema = createStudentSchema.partial().omit({ academicSessionId: true });

function toDto(row: {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  status: string;
  class_id: string | null;
  section_id: string | null;
  academic_session_id: string;
  user_id: string | null;
}) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    admissionNumber: row.admission_number,
    rollNumber: row.roll_number,
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    status: row.status,
    classId: row.class_id,
    sectionId: row.section_id,
    academicSessionId: row.academic_session_id,
    hasPortalLogin: Boolean(row.user_id),
  };
}

const router = Router();
router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/', requirePermissions('students.view'), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const q = String(req.query.q || '').trim().toLowerCase();
    const students = await prisma.students.findMany({
      where: {
        institution_id: institutionId,
        deleted_at: null,
        ...(q
          ? {
              OR: [
                { first_name: { contains: q, mode: 'insensitive' } },
                { last_name: { contains: q, mode: 'insensitive' } },
                { admission_number: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
      take: 200,
    });
    res.status(httpStatus.OK).json({
      success: true,
      data: { students: students.map(toDto) },
      meta: { page: 1, limit: 200, total: students.length, totalPages: 1 },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', requirePermissions('students.view'), async (req, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const students = await prisma.students.findMany({
      where: { institution_id: authReq.user.institutionId!, deleted_at: null },
      orderBy: [{ last_name: 'asc' }],
    });
    const header = 'admissionNumber,firstName,lastName,email,phone,rollNumber,status\n';
    const rows = students
      .map((s) =>
        [s.admission_number, s.first_name, s.last_name, s.email || '', s.phone || '', s.roll_number || '', s.status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.status(httpStatus.OK).send(header + rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requirePermissions('students.view'), validate({ params: idParams }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const student = await prisma.students.findFirst({
      where: {
        id: String(req.params.id),
        institution_id: authReq.user.institutionId!,
        deleted_at: null,
      },
    });
    if (!student) throw new NotFoundError('Student');
    res.status(httpStatus.OK).json({ success: true, data: { student: toDto(student) } });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermissions('students.create'), validate({ body: createStudentSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const body = req.body as z.infer<typeof createStudentSchema>;
    const existing = await prisma.students.findFirst({
      where: {
        institution_id: institutionId,
        admission_number: body.admissionNumber,
        deleted_at: null,
      },
    });
    if (existing) throw new ConflictError('Admission number already exists');

    const student = await prisma.students.create({
      data: {
        institution_id: institutionId,
        academic_session_id: body.academicSessionId,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        admission_number: body.admissionNumber.trim(),
        email: body.email?.trim().toLowerCase() || null,
        phone: body.phone?.trim() || null,
        gender: body.gender || null,
        roll_number: body.rollNumber || null,
        class_id: body.classId || null,
        section_id: body.sectionId || null,
        status: body.status || 'active',
      },
    });
    res.status(httpStatus.CREATED).json({ success: true, data: { student: toDto(student) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermissions('students.update'), validate({ params: idParams, body: updateStudentSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const id = String(req.params.id);
    const existing = await prisma.students.findFirst({
      where: { id, institution_id: institutionId, deleted_at: null },
    });
    if (!existing) throw new NotFoundError('Student');
    const body = req.body as z.infer<typeof updateStudentSchema>;
    const student = await prisma.students.update({
      where: { id },
      data: {
        first_name: body.firstName?.trim(),
        last_name: body.lastName?.trim(),
        admission_number: body.admissionNumber?.trim(),
        email: body.email === undefined ? undefined : body.email?.trim().toLowerCase() || null,
        phone: body.phone === undefined ? undefined : body.phone?.trim() || null,
        gender: body.gender,
        roll_number: body.rollNumber,
        class_id: body.classId,
        section_id: body.sectionId,
        status: body.status,
        updated_at: new Date(),
      },
    });
    res.status(httpStatus.OK).json({ success: true, data: { student: toDto(student) } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermissions('students.delete'), validate({ params: idParams }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = String(req.params.id);
    const existing = await prisma.students.findFirst({
      where: { id, institution_id: authReq.user.institutionId!, deleted_at: null },
    });
    if (!existing) throw new NotFoundError('Student');
    await prisma.students.update({
      where: { id },
      data: { deleted_at: new Date(), status: 'inactive', updated_at: new Date() },
    });
    res.status(httpStatus.OK).json({ success: true, message: 'Student archived' });
  } catch (error) {
    next(error);
  }
});

/** Create a portal login for this student (user_type=student, linked user_id). */
router.post(
  '/:id/portal-invite',
  requirePermissions('students.update'),
  validate({ params: idParams }),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const institutionId = authReq.user.institutionId!;
      const student = await prisma.students.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      });
      if (!student) throw new NotFoundError('Student');
      if (student.user_id) throw new ConflictError('Student already has a portal login');
      if (!student.email) throw new BadRequestError('Student email is required to invite to portal');

      const email = student.email.toLowerCase();
      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) throw new ConflictError('A user with this email already exists');

      const tempPassword = `Gg${crypto.randomBytes(4).toString('hex')}!S1`;
      const passwordHash = await hashPassword(tempPassword);
      const user = await prisma.users.create({
        data: {
          first_name: student.first_name,
          last_name: student.last_name,
          email,
          phone: student.phone,
          user_type: 'student',
          institution_id: institutionId,
          email_verified: true,
          is_active: true,
        },
      });
      await prisma.user_passwords.create({
        data: { user_id: user.id, password_hash: passwordHash, is_current: true },
      });
      await prisma.students.update({
        where: { id: student.id },
        data: { user_id: user.id, updated_at: new Date() },
      });

      await sendEmail({
        to: email,
        subject: 'GradGrid student portal access',
        text: `Hello ${student.first_name},\n\nYour student portal login:\nEmail: ${email}\nTemporary password: ${tempPassword}\nSign in: ${config.frontend.url}/portal/login\n`,
        html: `<p>Hello ${student.first_name},</p><p>Sign in at <a href="${config.frontend.url}/portal/login">portal login</a>.</p><p>Email: ${email}<br/>Temporary password: ${tempPassword}</p>`,
      });

      res.status(httpStatus.CREATED).json({
        success: true,
        data: {
          userId: user.id,
          temporaryPassword: config.smtp.host ? undefined : tempPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
