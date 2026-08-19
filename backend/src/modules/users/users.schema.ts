/**
 * GradGrid — User management schemas
 */

import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const inviteInstitutionUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roleName: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
});

export const invitePlatformUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roleName: z.string().min(2).max(100),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const assignRoleSchema = z.object({
  roleName: z.string().min(2).max(100),
});
