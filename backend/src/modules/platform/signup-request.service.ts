/**
 * GradGrid — Signup Request Service
 *
 * Self-service institution signup with admin approval gate.
 */

import { SignupRequestRepository } from './signup-request.repository';
import { AuthRepository } from '../auth/auth.repository';
import { hashPassword, verifyPassword } from '../../shared/utils/password';
import { sendEmail } from '../../shared/utils/email';
import {
  generateOtp,
  normalizeInstitutionCode,
  slugifyOrganizationName,
} from '../../shared/utils/signup';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ApplicationPendingError,
  ApplicationRejectedError,
} from '../../shared/errors';
import { createContextLogger, auditLog } from '../../shared/utils/logger';

const logger = createContextLogger({ module: 'signup-request' });

const OTP_TTL_MS = 10 * 60 * 1000;
const resendCooldown = new Map<string, number>();

export interface RegisterInstitutionInput {
  organizationName: string;
  institutionName: string;
  institutionCode: string;
  city?: string;
  state?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export class SignupRequestService {
  private repository = new SignupRequestRepository();
  private authRepository = new AuthRepository();

  async submitRequest(data: RegisterInstitutionInput) {
    const email = data.email.trim().toLowerCase();
    const phone = data.phone?.trim() || null;
    const institutionCode = normalizeInstitutionCode(data.institutionCode);

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists', 'EMAIL_ALREADY_REGISTERED');
    }

    if (phone) {
      const phoneUser = await this.repository.findUserByPhone(phone);
      if (phoneUser) {
        throw new ConflictError('A user with this phone number already exists', 'PHONE_ALREADY_REGISTERED');
      }
    }

    const pendingEmail = await this.repository.findPendingByEmail(email);
    if (pendingEmail) {
      if (!pendingEmail.email_verified) {
        return this.resendVerificationForPending(pendingEmail.id, email);
      }
      throw new ApplicationPendingError('An application with this email is already under review');
    }

    if (phone) {
      const pendingPhone = await this.repository.findPendingByPhone(phone);
      if (pendingPhone) {
        if (!pendingPhone.email_verified && pendingPhone.email === email) {
          return this.resendVerificationForPending(pendingPhone.id, email);
        }
        throw new ApplicationPendingError('An application with this phone number is already under review');
      }
    }

    if (await this.repository.institutionCodeInUse(institutionCode)) {
      throw new ConflictError('This institution code is already in use or reserved');
    }

    const password_hash = await hashPassword(data.password);
    const otp = generateOtp();
    const otp_hash = await hashPassword(otp);
    const otp_expires_at = new Date(Date.now() + OTP_TTL_MS);

    const request = await this.repository.create({
      organization_name: data.organizationName.trim(),
      institution_name: data.institutionName.trim(),
      institution_code: institutionCode,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email,
      phone,
      password_hash,
      otp_hash,
      otp_expires_at,
    });

    await sendEmail({
      to: email,
      subject: 'Verify your email — GradGrid signup',
      text: `Your GradGrid verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: `<p>Your GradGrid verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    auditLog('SIGNUP_REQUEST_SUBMITTED', {
      userId: email,
      role: 'applicant',
      resourceType: 'institution_signup_request',
      resourceId: request.id,
      details: { email, institutionCode },
    });

    logger.info({ requestId: request.id, email }, 'Signup request submitted');

    return {
      requestId: request.id,
      email,
      requiresEmailVerification: true,
    };
  }

  async verifyEmail(email: string, otp: string) {
    const request = await this.repository.findPendingByEmail(email.trim().toLowerCase());
    if (!request) {
      throw new NotFoundError('No pending signup application found for this email');
    }

    if (request.email_verified) {
      return { status: 'pending' as const, message: 'Email already verified. Awaiting admin approval.' };
    }

    if (!request.otp_hash || !request.otp_expires_at) {
      throw new BadRequestError('No active verification code. Please request a new one.');
    }

    if (request.otp_expires_at < new Date()) {
      throw new BadRequestError('Verification code has expired. Please request a new one.');
    }

    const valid = await verifyPassword(otp, request.otp_hash);
    if (!valid) {
      throw new BadRequestError('Invalid verification code');
    }

    await this.repository.markEmailVerified(request.id);

    auditLog('SIGNUP_EMAIL_VERIFIED', {
      userId: request.email,
      role: 'applicant',
      resourceType: 'institution_signup_request',
      resourceId: request.id,
      details: { email: request.email },
    });

    return {
      status: 'pending' as const,
      message: 'Email verified. Your application is awaiting admin approval.',
    };
  }

  async resendOtp(email: string) {
    const normalized = email.trim().toLowerCase();
    const lastSent = resendCooldown.get(normalized);
    if (lastSent && Date.now() - lastSent < 60_000) {
      throw new BadRequestError('Please wait before requesting another code');
    }

    const request = await this.repository.findPendingByEmail(normalized);
    if (!request) {
      throw new NotFoundError('No pending signup application found for this email');
    }

    if (request.email_verified) {
      throw new BadRequestError('Email is already verified');
    }

    const otp = generateOtp();
    const otp_hash = await hashPassword(otp);
    const otp_expires_at = new Date(Date.now() + OTP_TTL_MS);

    await this.repository.updateOtp(request.id, otp_hash, otp_expires_at);
    resendCooldown.set(normalized, Date.now());

    await sendEmail({
      to: normalized,
      subject: 'Your GradGrid verification code',
      text: `Your verification code is: ${otp}`,
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });

    return { message: 'Verification code sent' };
  }

  async getSignupStatus(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(normalized);
    if (user) {
      return { status: 'approved' as const, canLogin: true };
    }

    const latest = await this.repository.findByEmail(normalized);
    if (!latest) {
      return { status: 'none' as const, canLogin: false };
    }

    if (latest.status === 'pending') {
      return {
        status: 'pending' as const,
        canLogin: false,
        emailVerified: latest.email_verified,
      };
    }

    if (latest.status === 'rejected') {
      return { status: 'rejected' as const, canLogin: false, reason: latest.rejection_reason };
    }

    return { status: 'approved' as const, canLogin: true };
  }

  async listRequests(status?: 'pending' | 'approved' | 'rejected') {
    const rows = await this.repository.listByStatus(status);
    return rows.map((r) => this.toPublicRequest(r));
  }

  async getRequest(id: string) {
    const request = await this.repository.findById(id);
    if (!request) throw new NotFoundError('Signup request not found');
    return this.toPublicRequest(request);
  }

  async approveRequest(id: string, adminUserId: string) {
    const request = await this.repository.findById(id);
    if (!request) throw new NotFoundError('Signup request not found');
    if (request.status !== 'pending') {
      throw new BadRequestError('Only pending applications can be approved');
    }
    if (!request.email_verified) {
      throw new BadRequestError('Email must be verified before approval');
    }

    const existingUser = await this.authRepository.findUserByEmail(request.email);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    if (await this.repository.institutionCodeInUse(request.institution_code, request.id)) {
      throw new ConflictError('Institution code is no longer available');
    }

    let slug = slugifyOrganizationName(request.organization_name);
    let suffix = 1;
    while (await this.repository.findOrganizationBySlug(slug)) {
      slug = `${slugifyOrganizationName(request.organization_name)}-${suffix++}`;
    }

    const { user } = await this.repository.provisionInstitution({
      organization_name: request.organization_name,
      organization_slug: slug,
      organization_email: request.email,
      organization_phone: request.phone,
      institution_name: request.institution_name,
      institution_code: request.institution_code,
      city: request.city,
      state: request.state,
      first_name: request.first_name,
      last_name: request.last_name,
      email: request.email,
      phone: request.phone,
      password_hash: request.password_hash,
      reviewer_id: adminUserId,
    });

    await this.repository.markApproved(request.id, adminUserId, user.id);

    await sendEmail({
      to: request.email,
      subject: 'Your GradGrid application has been approved',
      text: `Welcome to GradGrid! Your institution account for ${request.institution_name} has been approved. You can now sign in at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      html: `<p>Welcome to GradGrid!</p><p>Your institution account for <strong>${request.institution_name}</strong> has been approved. You can now <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">sign in</a>.</p>`,
    });

    auditLog('SIGNUP_REQUEST_APPROVED', {
      userId: adminUserId,
      role: 'platform',
      resourceType: 'institution_signup_request',
      resourceId: request.id,
      details: { createdUserId: user.id, institutionCode: request.institution_code },
    });

    return { userId: user.id, email: user.email };
  }

  async rejectRequest(id: string, adminUserId: string, reason?: string) {
    const request = await this.repository.findById(id);
    if (!request) throw new NotFoundError('Signup request not found');
    if (request.status !== 'pending') {
      throw new BadRequestError('Only pending applications can be rejected');
    }

    await this.repository.markRejected(id, adminUserId, reason);

    await sendEmail({
      to: request.email,
      subject: 'Update on your GradGrid application',
      text: `Your GradGrid application was not approved at this time.${reason ? ` Reason: ${reason}` : ''} You may submit a new application.`,
      html: `<p>Your GradGrid application was not approved at this time.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}<p>You may submit a new application.</p>`,
    });

    auditLog('SIGNUP_REQUEST_REJECTED', {
      userId: adminUserId,
      role: 'platform',
      resourceType: 'institution_signup_request',
      resourceId: id,
      details: { reason },
    });

    return { id };
  }

  async checkLoginBlocked(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const pending = await this.repository.findPendingByEmail(normalized);
    if (pending) {
      throw new ApplicationPendingError();
    }

    const latest = await this.repository.findByEmail(normalized);
    if (latest?.status === 'rejected') {
      const user = await this.authRepository.findUserByEmail(normalized);
      if (!user) {
        throw new ApplicationRejectedError();
      }
    }
  }

  private async resendVerificationForPending(requestId: string, email: string) {
    const otp = generateOtp();
    const otp_hash = await hashPassword(otp);
    const otp_expires_at = new Date(Date.now() + OTP_TTL_MS);

    await this.repository.updateOtp(requestId, otp_hash, otp_expires_at);

    await sendEmail({
      to: email,
      subject: 'Verify your email — GradGrid signup',
      text: `Your GradGrid verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
      html: `<p>Your GradGrid verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    logger.info({ requestId, email }, 'Resent signup verification for pending application');

    return {
      requestId,
      email,
      requiresEmailVerification: true,
    };
  }

  private toPublicRequest(r: {
    id: string;
    status: string;
    organization_name: string;
    institution_name: string;
    institution_code: string;
    city: string | null;
    state: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    email_verified: boolean;
    rejection_reason: string | null;
    created_at: Date;
    reviewed_at: Date | null;
  }) {
    return {
      id: r.id,
      status: r.status,
      organizationName: r.organization_name,
      institutionName: r.institution_name,
      institutionCode: r.institution_code,
      city: r.city,
      state: r.state,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      emailVerified: r.email_verified,
      rejectionReason: r.rejection_reason,
      submittedAt: r.created_at,
      reviewedAt: r.reviewed_at,
    };
  }
}
