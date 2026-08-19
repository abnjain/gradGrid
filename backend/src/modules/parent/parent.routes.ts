/**
 * GradGrid — Parent staff APIs (institution-scoped) + child linking
 */

import { z } from 'zod';
import { Router } from 'express';
import httpStatus from 'http-status';
import crypto from 'crypto';
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
import { sendEmail } from '../../shared/utils/email';
import { config } from '../../config';

const idParams = z.object({ id: z.string().uuid() });
const createParentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  relation: z.string().min(1).max(30),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional(),
  studentIds: z.array(z.string().uuid()).optional(),
});

const router = Router();
router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/', requirePermissions('students.view'), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const parents = await prisma.parents.findMany({
      where: { institution_id: institutionId, deleted_at: null },
      include: {
        student_parent_links: {
          include: { student: { select: { id: true, first_name: true, last_name: true, admission_number: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        parents: parents.map((p) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          name: `${p.first_name} ${p.last_name}`.trim(),
          relation: p.relation,
          phone: p.phone,
          email: p.email,
          hasPortalLogin: Boolean(p.user_id),
          children: p.student_parent_links.map((l) => ({
            id: l.student.id,
            name: `${l.student.first_name} ${l.student.last_name}`.trim(),
            admissionNumber: l.student.admission_number,
            isPrimary: l.is_primary,
          })),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermissions('students.create'), validate({ body: createParentSchema }), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const body = req.body as z.infer<typeof createParentSchema>;
    const parent = await prisma.parents.create({
      data: {
        institution_id: institutionId,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        relation: body.relation.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim().toLowerCase() || null,
      },
    });

    if (body.studentIds?.length) {
      const students = await prisma.students.findMany({
        where: {
          id: { in: body.studentIds },
          institution_id: institutionId,
          deleted_at: null,
        },
        select: { id: true },
      });
      if (students.length !== body.studentIds.length) {
        throw new BadRequestError('One or more students are not in this institution');
      }
      await prisma.student_parent_links.createMany({
        data: students.map((s, index) => ({
          student_id: s.id,
          parent_id: parent.id,
          is_primary: index === 0,
        })),
        skipDuplicates: true,
      });
    }

    res.status(httpStatus.CREATED).json({ success: true, data: { parent: { id: parent.id } } });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:id/link-student',
  requirePermissions('students.update'),
  validate({
    params: idParams,
    body: z.object({ studentId: z.string().uuid(), isPrimary: z.boolean().optional() }),
  }),
  async (req, res, next) => {
    try {
      const institutionId = (req as AuthenticatedRequest).user.institutionId!;
      const parent = await prisma.parents.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      });
      if (!parent) throw new NotFoundError('Parent');
      const student = await prisma.students.findFirst({
        where: {
          id: req.body.studentId,
          institution_id: institutionId,
          deleted_at: null,
        },
      });
      if (!student) throw new NotFoundError('Student');
      await prisma.student_parent_links.create({
        data: {
          parent_id: parent.id,
          student_id: student.id,
          is_primary: Boolean(req.body.isPrimary),
        },
      });
      res.status(httpStatus.CREATED).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/portal-invite',
  requirePermissions('students.update'),
  validate({ params: idParams }),
  async (req, res, next) => {
    try {
      const institutionId = (req as AuthenticatedRequest).user.institutionId!;
      const parent = await prisma.parents.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      });
      if (!parent) throw new NotFoundError('Parent');
      if (parent.user_id) throw new ConflictError('Parent already has a portal login');
      if (!parent.email) throw new BadRequestError('Parent email is required to invite to portal');

      const email = parent.email.toLowerCase();
      const existingUser = await prisma.users.findUnique({ where: { email } });
      if (existingUser) throw new ConflictError('A user with this email already exists');

      const tempPassword = `Gg${crypto.randomBytes(4).toString('hex')}!P1`;
      const passwordHash = await hashPassword(tempPassword);
      const user = await prisma.users.create({
        data: {
          first_name: parent.first_name,
          last_name: parent.last_name,
          email,
          phone: parent.phone,
          user_type: 'parent',
          institution_id: institutionId,
          email_verified: true,
          is_active: true,
        },
      });
      await prisma.user_passwords.create({
        data: { user_id: user.id, password_hash: passwordHash, is_current: true },
      });
      await prisma.parents.update({
        where: { id: parent.id },
        data: { user_id: user.id, updated_at: new Date() },
      });

      await sendEmail({
        to: email,
        subject: 'GradGrid parent portal access',
        text: `Hello ${parent.first_name},\n\nPortal login:\nEmail: ${email}\nTemporary password: ${tempPassword}\nSign in: ${config.frontend.url}/portal/login\nYou will only see children linked to you at this institution.`,
        html: `<p>Hello ${parent.first_name},</p><p>Sign in at <a href="${config.frontend.url}/portal/login">portal login</a>.</p><p>Email: ${email}<br/>Temporary password: ${tempPassword}</p><p>You will only see children linked to you at this institution.</p>`,
      });

      res.status(httpStatus.CREATED).json({
        success: true,
        data: { userId: user.id, temporaryPassword: config.smtp.host ? undefined : tempPassword },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
