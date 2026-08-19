/**
 * GradGrid — RBAC validation schemas
 */

import { z } from 'zod';

export const roleIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  permissionKeys: z.array(z.string().min(3).max(120)).optional(),
});

export const updateRoleSchema = z
  .object({
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.description !== undefined || data.isActive !== undefined, {
    message: 'At least one field is required',
  });

export const replacePermissionsSchema = z.object({
  permissionKeys: z.array(z.string().min(3).max(120)),
});
