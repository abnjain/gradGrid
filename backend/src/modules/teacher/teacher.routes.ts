/**
 * GradGrid — Teacher and staff APIs (institution-scoped)
 */

import { z } from 'zod';
import { Router, Request, Response, NextFunction } from 'express';
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
import { auditLog } from '../../shared/utils/logger';

const idParams = z.object({ id: z.string().uuid() });

const createTeacherSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(20),
  employeeCode: z.string().max(50).optional(),
  departmentId: z.string().uuid().optional(),
  designation: z.string().max(100).optional(),
  qualification: z.string().max(1000).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
  employmentStatus: z.string().max(20).optional(),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  address: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
});

const updateTeacherSchema = createTeacherSchema.partial();

function toDto(row: {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string | null;
  qualification: string | null;
  experience_years: number | null;
  employment_status: string;
  joining_date: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  department_id: string | null;
  department?: { name: string } | null;
}) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: row.phone,
    designation: row.designation,
    qualification: row.qualification,
    experienceYears: row.experience_years,
    employmentStatus: row.employment_status,
    joiningDate: row.joining_date,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    departmentId: row.department_id,
    departmentName: row.department?.name || null,
  };
}

async function ensureDepartment(institutionId: string, departmentId?: string | null) {
  if (!departmentId) return;
  const department = await prisma.departments.findFirst({
    where: { id: departmentId, institution_id: institutionId, deleted_at: null },
    select: { id: true },
  });
  if (!department) throw new BadRequestError('Department is not in this institution');
}

const include = { department: { select: { name: true } } } as const;
const router = Router();
router.use(authenticate, loadPermissions, requireInstitutionScope);

router.get('/', requirePermissions('teachers.view'), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const q = String(req.query.q || '').trim().toLowerCase();
    const rows = await prisma.staff.findMany({
      where: {
        institution_id: institutionId,
        deleted_at: null,
        ...(q
          ? {
              OR: [
                { first_name: { contains: q, mode: 'insensitive' } },
                { last_name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { employee_code: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include,
      orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
      take: 200,
    });
    res.status(httpStatus.OK).json({
      success: true,
      data: { teachers: rows.map(toDto) },
      meta: { page: 1, limit: 200, total: rows.length, totalPages: 1 },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export/csv', requirePermissions('teachers.export'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const rows = await prisma.staff.findMany({
      where: { institution_id: institutionId, deleted_at: null },
      include,
      orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
    });
    const header = 'employeeCode,firstName,lastName,email,phone,department,designation,employmentStatus\n';
    const csv = rows
      .map((row) =>
        [
          row.employee_code,
          row.first_name,
          row.last_name,
          row.email,
          row.phone,
          row.department?.name,
          row.designation,
          row.employment_status,
        ]
          .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teachers.csv"');
    res.status(httpStatus.OK).send(header + csv);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requirePermissions('teachers.view'), validate({ params: idParams }), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const row = await prisma.staff.findFirst({
      where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      include,
    });
    if (!row) throw new NotFoundError('Teacher');
    res.status(httpStatus.OK).json({ success: true, data: { teacher: toDto(row) } });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermissions('teachers.create'), validate({ body: createTeacherSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const body = req.body as z.infer<typeof createTeacherSchema>;
    await ensureDepartment(institutionId, body.departmentId);
    if (body.employeeCode) {
      const existing = await prisma.staff.findFirst({
        where: { institution_id: institutionId, employee_code: body.employeeCode.trim(), deleted_at: null },
        select: { id: true },
      });
      if (existing) throw new ConflictError('Employee code already exists');
    }
    const row = await prisma.staff.create({
      data: {
        institution_id: institutionId,
        first_name: body.firstName.trim(),
        last_name: body.lastName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        employee_code: body.employeeCode?.trim() || null,
        department_id: body.departmentId || null,
        designation: body.designation?.trim() || null,
        qualification: body.qualification?.trim() || null,
        experience_years: body.experienceYears ?? null,
        employment_status: body.employmentStatus || 'active',
        joining_date: body.joiningDate ? new Date(body.joiningDate) : null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        pincode: body.pincode?.trim() || null,
      },
      include,
    });
    auditLog('TEACHER_CREATED', {
      userId: authReq.user.id,
      role: authReq.user.roleName,
      institutionId,
      resourceType: 'staff',
      resourceId: row.id,
      details: { email: row.email, employeeCode: row.employee_code },
    });
    res.status(httpStatus.CREATED).json({ success: true, data: { teacher: toDto(row) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requirePermissions('teachers.update'), validate({ params: idParams, body: updateTeacherSchema }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const id = String(req.params.id);
    const existing = await prisma.staff.findFirst({
      where: { id, institution_id: institutionId, deleted_at: null },
    });
    if (!existing) throw new NotFoundError('Teacher');
    const body = req.body as z.infer<typeof updateTeacherSchema>;
    await ensureDepartment(institutionId, body.departmentId);
    if (body.employeeCode && body.employeeCode.trim() !== existing.employee_code) {
      const duplicate = await prisma.staff.findFirst({
        where: { institution_id: institutionId, employee_code: body.employeeCode.trim(), deleted_at: null, NOT: { id } },
        select: { id: true },
      });
      if (duplicate) throw new ConflictError('Employee code already exists');
    }
    const row = await prisma.staff.update({
      where: { id },
      data: {
        ...(body.firstName !== undefined ? { first_name: body.firstName.trim() } : {}),
        ...(body.lastName !== undefined ? { last_name: body.lastName.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email.trim().toLowerCase() } : {}),
        ...(body.phone !== undefined ? { phone: body.phone.trim() } : {}),
        ...(body.employeeCode !== undefined ? { employee_code: body.employeeCode.trim() || null } : {}),
        ...(body.departmentId !== undefined ? { department_id: body.departmentId || null } : {}),
        ...(body.designation !== undefined ? { designation: body.designation.trim() || null } : {}),
        ...(body.qualification !== undefined ? { qualification: body.qualification.trim() || null } : {}),
        ...(body.experienceYears !== undefined ? { experience_years: body.experienceYears } : {}),
        ...(body.employmentStatus !== undefined ? { employment_status: body.employmentStatus } : {}),
        ...(body.joiningDate !== undefined ? { joining_date: body.joiningDate ? new Date(body.joiningDate) : null } : {}),
        ...(body.address !== undefined ? { address: body.address.trim() || null } : {}),
        ...(body.city !== undefined ? { city: body.city.trim() || null } : {}),
        ...(body.state !== undefined ? { state: body.state.trim() || null } : {}),
        ...(body.pincode !== undefined ? { pincode: body.pincode.trim() || null } : {}),
        updated_at: new Date(),
      },
      include,
    });
    auditLog('TEACHER_UPDATED', {
      userId: authReq.user.id,
      role: authReq.user.roleName,
      institutionId,
      resourceType: 'staff',
      resourceId: id,
      details: body,
    });
    res.status(httpStatus.OK).json({ success: true, data: { teacher: toDto(row) } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermissions('teachers.delete'), validate({ params: idParams }), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const institutionId = authReq.user.institutionId!;
    const id = String(req.params.id);
    const existing = await prisma.staff.findFirst({
      where: { id, institution_id: institutionId, deleted_at: null },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Teacher');
    await prisma.staff.update({
      where: { id },
      data: { deleted_at: new Date(), employment_status: 'inactive', updated_at: new Date() },
    });
    auditLog('TEACHER_ARCHIVED', {
      userId: authReq.user.id,
      role: authReq.user.roleName,
      institutionId,
      resourceType: 'staff',
      resourceId: id,
    });
    res.status(httpStatus.OK).json({ success: true, message: 'Teacher archived' });
  } catch (error) {
    next(error);
  }
});

export default router;
