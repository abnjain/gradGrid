/**
 * GradGrid — Admissions enquiry APIs (institution-scoped)
 */

import { z } from 'zod';
import { Router, Response } from 'express';
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
import { config } from '../../config';
import { auditLog } from '../../shared/utils/logger';
import {
  createStorageKey,
  deleteFile,
  putFile,
  readFile,
} from '../../shared/utils/file-storage';

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

const documentBodySchema = z.object({
  documentType: z.string().min(1).max(50),
  originalName: z.string().min(1).max(255),
  mimeType: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]),
  contentBase64: z.string().min(1).max(9_500_000),
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

router.get('/:id', requirePermissions('admissions.view'), validate({ params: idParams }), async (req, res, next) => {
  try {
    const institutionId = (req as AuthenticatedRequest).user.institutionId!;
    const enquiry = await prisma.admission_enquiries.findFirst({
      where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
      include: {
        documents: {
          include: { file: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!enquiry) throw new NotFoundError('Enquiry');
    res.status(httpStatus.OK).json({
      success: true,
      data: {
        enquiry: {
          id: enquiry.id,
          status: enquiry.status,
          source: enquiry.source,
          studentFirstName: enquiry.student_first_name,
          studentLastName: enquiry.student_last_name,
          studentName: `${enquiry.student_first_name} ${enquiry.student_last_name}`.trim(),
          parentName: enquiry.parent_name,
          parentPhone: enquiry.parent_phone,
          parentEmail: enquiry.parent_email,
          applyingForClass: enquiry.applying_for_class,
          academicSessionId: enquiry.academic_session_id,
          convertedStudentId: enquiry.converted_student_id,
          createdAt: enquiry.created_at,
          documents: enquiry.documents.map((document) => ({
            id: document.id,
            documentType: document.document_type,
            originalName: document.file.original_name,
            mimeType: document.file.mime_type,
            sizeBytes: Number(document.file.size_bytes),
            createdAt: document.created_at,
          })),
        },
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
  '/:id/documents',
  requirePermissions('admissions.update'),
  validate({ params: idParams, body: documentBodySchema }),
  async (req, res, next) => {
    let storageKey: string | undefined;
    try {
      const authReq = req as AuthenticatedRequest;
      const institutionId = authReq.user.institutionId!;
      const enquiry = await prisma.admission_enquiries.findFirst({
        where: { id: String(req.params.id), institution_id: institutionId, deleted_at: null },
        select: { id: true },
      });
      if (!enquiry) throw new NotFoundError('Enquiry');

      const body = req.body as z.infer<typeof documentBodySchema>;
      const encoded = body.contentBase64.replace(/^data:[^;]+;base64,/, '');
      const content = Buffer.from(encoded, 'base64');
      const maxBytes = 7 * 1024 * 1024;
      if (!content.length || content.length > maxBytes) {
        throw new BadRequestError('Document must be between 1 byte and 7 MB');
      }

      storageKey = createStorageKey(`${institutionId}/admissions/${enquiry.id}`, body.originalName);
      await putFile(storageKey, content);

      const document = await prisma.$transaction(async (tx) => {
        const file = await tx.file_uploads.create({
          data: {
            institution_id: institutionId,
            uploaded_by: authReq.user.id,
            original_name: body.originalName.trim(),
            storage_key: storageKey!,
            bucket: config.storage.bucket,
            mime_type: body.mimeType,
            size_bytes: BigInt(content.length),
            entity_type: 'admission_enquiry',
            entity_id: enquiry.id,
          },
        });
        return tx.admission_enquiry_documents.create({
          data: {
            enquiry_id: enquiry.id,
            file_id: file.id,
            document_type: body.documentType.trim().toLowerCase(),
            uploaded_by: authReq.user.id,
          },
          include: { file: true },
        });
      });

      auditLog('ADMISSION_DOCUMENT_UPLOADED', {
        userId: authReq.user.id,
        role: authReq.user.roleName,
        institutionId,
        resourceType: 'admission_enquiry_document',
        resourceId: document.id,
        details: { enquiryId: enquiry.id, documentType: document.document_type },
      });
      res.status(httpStatus.CREATED).json({
        success: true,
        data: {
          document: {
            id: document.id,
            documentType: document.document_type,
            originalName: document.file.original_name,
            mimeType: document.file.mime_type,
            sizeBytes: Number(document.file.size_bytes),
            createdAt: document.created_at,
          },
        },
      });
    } catch (error) {
      if (storageKey) {
        await deleteFile(storageKey).catch(() => undefined);
      }
      next(error);
    }
  }
);

router.get(
  '/:id/documents/:documentId/content',
  requirePermissions('admissions.view'),
  validate({ params: z.object({ id: z.string().uuid(), documentId: z.string().uuid() }) }),
  async (req, res: Response, next) => {
    try {
      const institutionId = (req as AuthenticatedRequest).user.institutionId!;
      const document = await prisma.admission_enquiry_documents.findFirst({
        where: {
          id: String(req.params.documentId),
          enquiry_id: String(req.params.id),
          enquiry: { institution_id: institutionId, deleted_at: null },
        },
        include: { file: true },
      });
      if (!document) throw new NotFoundError('Document');
      const content = await readFile(document.file.storage_key);
      res.setHeader('Content-Type', document.file.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${document.file.original_name.replace(/"/g, '')}"`);
      res.status(httpStatus.OK).send(content);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id/documents/:documentId',
  requirePermissions('admissions.update'),
  validate({ params: z.object({ id: z.string().uuid(), documentId: z.string().uuid() }) }),
  async (req, res, next) => {
    try {
      const institutionId = (req as AuthenticatedRequest).user.institutionId!;
      const document = await prisma.admission_enquiry_documents.findFirst({
        where: {
          id: String(req.params.documentId),
          enquiry_id: String(req.params.id),
          enquiry: { institution_id: institutionId, deleted_at: null },
        },
        include: { file: true },
      });
      if (!document) throw new NotFoundError('Document');
      await prisma.$transaction([
        prisma.admission_enquiry_documents.delete({ where: { id: document.id } }),
        prisma.file_uploads.delete({ where: { id: document.file_id } }),
      ]);
      await deleteFile(document.file.storage_key).catch(() => undefined);
      const authReq = req as AuthenticatedRequest;
      auditLog('ADMISSION_DOCUMENT_DELETED', {
        userId: authReq.user.id,
        role: authReq.user.roleName,
        institutionId,
        resourceType: 'admission_enquiry_document',
        resourceId: document.id,
      });
      res.status(httpStatus.OK).json({ success: true, message: 'Document deleted' });
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
