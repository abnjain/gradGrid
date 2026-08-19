/**
 * GradGrid — Learner portal (student / parent) — institution-scoped self-service
 *
 * Students: only their own profile, class, and ID-card fields at their institution.
 * Parents: only children linked via student_parent_links at their institution.
 */

import { prisma } from '../../config/database';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../shared/errors';

function studentDto(student: {
  id: string;
  institution_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  gender: string | null;
  date_of_birth: Date | null;
  photo_file_id: string | null;
  class_id: string | null;
  section_id: string | null;
  institution?: { id: string; name: string; code: string };
  academic_session?: { id: string; name: string } | null;
  class_ref?: { id: string; name: string } | null;
  section_ref?: { id: string; name: string } | null;
}) {
  return {
    id: student.id,
    institutionId: student.institution_id,
    institutionName: student.institution?.name,
    institutionCode: student.institution?.code,
    academicSessionName: student.academic_session?.name || null,
    firstName: student.first_name,
    lastName: student.last_name,
    name: `${student.first_name} ${student.last_name}`.trim(),
    admissionNumber: student.admission_number,
    rollNumber: student.roll_number,
    email: student.email,
    phone: student.phone,
    status: student.status,
    gender: student.gender,
    dateOfBirth: student.date_of_birth,
    photoFileId: student.photo_file_id,
    classId: student.class_id,
    sectionId: student.section_id,
    className: student.class_ref?.name || null,
    sectionName: student.section_ref?.name || null,
  };
}

const studentInclude = {
  institution: { select: { id: true, name: true, code: true } },
  academic_session: { select: { id: true, name: true } },
} as const;

export class PortalService {
  async getStudentSelf(userId: string, institutionId?: string | null) {
    const student = await prisma.students.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
        ...(institutionId ? { institution_id: institutionId } : {}),
      },
      include: studentInclude,
    });
    if (!student) throw new NotFoundError('Student profile');
    if (institutionId && student.institution_id !== institutionId) {
      throw new ForbiddenError('Student does not belong to this institution');
    }

    const classRow = student.class_id
      ? await prisma.classes.findFirst({
          where: { id: student.class_id, institution_id: student.institution_id },
          select: { id: true, name: true },
        })
      : null;
    const sectionRow = student.section_id
      ? await prisma.sections.findFirst({
          where: { id: student.section_id },
          select: { id: true, name: true },
        })
      : null;

    return studentDto({
      ...student,
      class_ref: classRow,
      section_ref: sectionRow,
    });
  }

  async getStudentIdCard(userId: string, institutionId?: string | null) {
    const profile = await this.getStudentSelf(userId, institutionId);
    return {
      cardType: 'student_id',
      institutionName: profile.institutionName,
      institutionCode: profile.institutionCode,
      studentName: profile.name,
      admissionNumber: profile.admissionNumber,
      rollNumber: profile.rollNumber,
      className: profile.className,
      sectionName: profile.sectionName,
      academicSessionName: profile.academicSessionName,
      photoFileId: profile.photoFileId,
      status: profile.status,
    };
  }

  async getParentChildren(userId: string, institutionId?: string | null) {
    const parent = await prisma.parents.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
        ...(institutionId ? { institution_id: institutionId } : {}),
      },
    });
    if (!parent) throw new NotFoundError('Parent profile');
    if (institutionId && parent.institution_id !== institutionId) {
      throw new ForbiddenError('Parent does not belong to this institution');
    }

    const links = await prisma.student_parent_links.findMany({
      where: { parent_id: parent.id },
      include: {
        student: {
          include: studentInclude,
        },
      },
    });

    const children = [];
    for (const link of links) {
      const student = link.student;
      if (student.deleted_at || student.institution_id !== parent.institution_id) {
        continue;
      }
      const classRow = student.class_id
        ? await prisma.classes.findFirst({
            where: { id: student.class_id, institution_id: student.institution_id },
            select: { id: true, name: true },
          })
        : null;
      const sectionRow = student.section_id
        ? await prisma.sections.findFirst({
            where: { id: student.section_id },
            select: { id: true, name: true },
          })
        : null;
      children.push({
        ...studentDto({
          ...student,
          class_ref: classRow,
          section_ref: sectionRow,
        }),
        isPrimary: link.is_primary,
      });
    }

    return {
      parent: {
        id: parent.id,
        firstName: parent.first_name,
        lastName: parent.last_name,
        name: `${parent.first_name} ${parent.last_name}`.trim(),
        relation: parent.relation,
        institutionId: parent.institution_id,
      },
      children,
    };
  }

  async getHome(userId: string, userType: string, institutionId?: string | null) {
    if (userType === 'student') {
      const student = await this.getStudentSelf(userId, institutionId);
      return { role: 'student' as const, student };
    }
    if (userType === 'parent') {
      const family = await this.getParentChildren(userId, institutionId);
      return { role: 'parent' as const, ...family };
    }
    throw new UnauthorizedError('Portal access is only for students and parents');
  }
}

export const portalService = new PortalService();
