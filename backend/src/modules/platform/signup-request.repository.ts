/**
 * GradGrid — Signup Request Repository
 */

import { prisma } from '../../config/database';

export type SignupRequestStatus = 'pending' | 'approved' | 'rejected';

export class SignupRequestRepository {
  async findByEmail(email: string) {
    return prisma.institution_signup_requests.findFirst({
      where: { email: email.toLowerCase() },
      orderBy: { created_at: 'desc' },
    });
  }

  async findPendingByEmail(email: string) {
    return prisma.institution_signup_requests.findFirst({
      where: { email: email.toLowerCase(), status: 'pending' },
    });
  }

  async findPendingByPhone(phone: string) {
    return prisma.institution_signup_requests.findFirst({
      where: { phone, status: 'pending' },
    });
  }

  async findById(id: string) {
    return prisma.institution_signup_requests.findUnique({ where: { id } });
  }

  async listByStatus(status?: SignupRequestStatus) {
    return prisma.institution_signup_requests.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
    });
  }

  async institutionCodeInUse(code: string, excludeRequestId?: string) {
    const live = await prisma.institutions.findFirst({
      where: { code, deleted_at: null },
    });
    if (live) return true;

    const pending = await prisma.institution_signup_requests.findFirst({
      where: {
        institution_code: code,
        status: 'pending',
        ...(excludeRequestId ? { NOT: { id: excludeRequestId } } : {}),
      },
    });
    return !!pending;
  }

  async create(data: {
    organization_name: string;
    institution_name: string;
    institution_code: string;
    city?: string | null;
    state?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    password_hash: string;
    otp_hash: string;
    otp_expires_at: Date;
  }) {
    return prisma.institution_signup_requests.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        status: 'pending',
        email_verified: false,
      },
    });
  }

  async updateOtp(id: string, otp_hash: string, otp_expires_at: Date) {
    return prisma.institution_signup_requests.update({
      where: { id },
      data: { otp_hash, otp_expires_at, updated_at: new Date() },
    });
  }

  async markEmailVerified(id: string) {
    return prisma.institution_signup_requests.update({
      where: { id },
      data: {
        email_verified: true,
        otp_hash: null,
        otp_expires_at: null,
        updated_at: new Date(),
      },
    });
  }

  async markApproved(id: string, reviewed_by: string, created_user_id: string) {
    return prisma.institution_signup_requests.update({
      where: { id },
      data: {
        status: 'approved',
        reviewed_by,
        reviewed_at: new Date(),
        created_user_id,
        updated_at: new Date(),
      },
    });
  }

  async markRejected(id: string, reviewed_by: string, rejection_reason?: string) {
    return prisma.institution_signup_requests.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewed_by,
        reviewed_at: new Date(),
        rejection_reason: rejection_reason || null,
        updated_at: new Date(),
      },
    });
  }

  async findUserByPhone(phone: string) {
    return prisma.users.findFirst({
      where: { phone, deleted_at: null },
    });
  }

  async findOrganizationBySlug(slug: string) {
    return prisma.organizations.findFirst({
      where: { slug, deleted_at: null },
    });
  }

  async provisionInstitution(data: {
    organization_name: string;
    organization_slug: string;
    organization_email: string;
    organization_phone?: string | null;
    institution_name: string;
    institution_code: string;
    city?: string | null;
    state?: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    password_hash: string;
    reviewer_id: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const organization = await tx.organizations.create({
        data: {
          name: data.organization_name,
          slug: data.organization_slug,
          email: data.organization_email,
          phone: data.organization_phone,
        },
      });

      const institution = await tx.institutions.create({
        data: {
          organization_id: organization.id,
          name: data.institution_name,
          code: data.institution_code,
          email: data.email,
          phone: data.phone,
          city: data.city,
          state: data.state,
        },
      });

      const user = await tx.users.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          user_type: 'institution',
          institution_id: institution.id,
          email_verified: true,
          is_active: true,
        },
      });

      await tx.user_passwords.create({
        data: {
          user_id: user.id,
          password_hash: data.password_hash,
          is_current: true,
        },
      });

      const ownerRole = await tx.roles.create({
        data: {
          institution_id: institution.id,
          name: 'institution_owner',
          description: 'Institution Owner — full institution control',
          is_system_role: true,
        },
      });

      await tx.role_assignments.create({
        data: {
          user_id: user.id,
          role_id: ownerRole.id,
          institution_id: institution.id,
          assigned_by: user.id,
        },
      });

      return { organization, institution, user };
    });
  }
}
