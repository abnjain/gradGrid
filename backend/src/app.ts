/**
 * GradGrid — Express Application
 *
 * Configures middleware, routes, and error handling.
 */

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { requestId, errorHandler } from './middleware';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Catch body-parser SyntaxError (malformed JSON)
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON in request body',
      },
    });
    return;
  }
  next(err);
});

// Cookie parsing
app.use(cookieParser());

// Request tracing
app.use(requestId);

// Root health check — accessible at /health without API prefix
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'GradGrid API',
      status: 'running',
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes — all module routes mounted under config.api.prefix
app.use(config.api.prefix, routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
