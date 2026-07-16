/**
 * GradGrid — Health Check Routes
 *
 * Public health-check and status endpoints.
 * Will emit diagnostics, uptime, DB status, etc. in future iterations.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Basic liveness probe.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'GradGrid API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
