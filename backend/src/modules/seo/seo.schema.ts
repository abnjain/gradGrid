/**
 * GradGrid — SEO Schema
 *
 * Zod validation schemas for SEO-related query parameters.
 */

import { z } from 'zod';

export const sitemapQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 500))
    .pipe(z.number().int().positive().max(5000)),
});

export type SitemapQuery = z.infer<typeof sitemapQuerySchema>;
