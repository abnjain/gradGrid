/**
 * GradGrid — Auth Validation Schemas
 *
 * Each schema validates one request location (body, query, or params).
 * Route files use them like: validate({ body: loginSchema })
 */

import { z } from 'zod';

/** Strong password policy — aligned with frontend validators.ts */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const registerInstitutionSchema = z.object({
  organizationName: z.string().min(2, 'Organization name is required').max(200),
  institutionName: z.string().min(2, 'Institution name is required').max(200),
  institutionCode: z.string().regex(/^[A-Za-z0-9-]{2,20}$/, 'Institution code must be 2–20 alphanumeric characters'),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z
    .union([
      z.string().regex(/^[+]?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number'),
      z.literal(''),
    ])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  password: strongPasswordSchema,
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().regex(/^\d{6}$/, 'Verification code must be 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const signupStatusQuerySchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const signupRequestParamsSchema = z.object({
  id: z.string().uuid('Invalid request id'),
});

export const rejectSignupSchema = z.object({
  reason: z.string().max(500).optional(),
});

/** @deprecated Use registerInstitutionSchema */
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: strongPasswordSchema,
  institutionId: z.string().uuid().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: strongPasswordSchema,
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z
    .union([
      z.string().regex(/^[+]?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordSchema,
});

export const sessionParamsSchema = z.object({
  sessionId: z.string().uuid('Invalid session id'),
});

export const selectContextSchema = z.object({
  organizationId: z.string().uuid('Invalid organization id'),
  institutionId: z.string().uuid('Invalid institution id'),
});
