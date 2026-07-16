/**
 * GradGrid — Shared Types
 */

import { Request } from 'express';

/**
 * Authenticated user payload embedded in request after JWT verification.
 */
export interface AuthUser {
  id: string;
  email: string;
  userType: 'platform' | 'institution';
  institutionId?: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
  /** Session identifier embedded in JWT — checked on each request. */
  sessionId: string;
}

/**
 * Express request extended with authenticated user.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Pagination query parameters.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard API envelope response.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Permission key format: module.action (e.g., students.view)
 */
export type PermissionKey = `${string}.${string}`;
