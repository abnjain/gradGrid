/**
 * GradGrid — Email Service
 *
 * Lightweight nodemailer wrapper for transactional emails
 * (password reset, email verification, etc.).
 *
 * When SMTP is not configured (dev), emails are "sent" to the
 * pino log stream so flows can be developed without a mail server.
 */

import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config';
import { createContextLogger } from './logger';

const logger = createContextLogger({ module: 'email' });

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const smtp = config.smtp;

  // No SMTP configured — dev fallback that logs the email instead of sending.
  if (!smtp.host) {
    logger.warn(
      { production: config.isProd },
      'SMTP not configured — emails will be logged instead of sent'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure, // true for 465, false for other ports
    auth:
      smtp.user && smtp.pass
        ? { user: smtp.user, pass: smtp.pass }
        : undefined,
  });

  return transporter;
}

/** Verify SMTP credentials during startup so Render logs the real failure. */
export async function verifyEmailTransport(): Promise<boolean> {
  const t = getTransporter();
  if (!t) return false;

  try {
    await t.verify();
    logger.info(
      {
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        userConfigured: Boolean(config.smtp.user),
      },
      'SMTP connection verified'
    );
    return true;
  } catch (error) {
    logger.error(
      {
        err: error,
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
      },
      'SMTP connection verification failed'
    );
    return false;
  }
}

/**
 * Send an email. Returns true when the email was accepted by the
 * transport (or logged in dev mode when SMTP is unset).
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const t = getTransporter();

  // Dev fallback — log the email so the flow is testable without SMTP.
  if (!t) {
    if (config.isDev) {
      logger.info(
        {
          to: input.to,
          subject: input.subject,
          text: input.text,
        },
        'EMAIL_DEV_LOG — would send email'
      );
    } else {
      logger.error({ to: input.to, subject: input.subject }, 'Email not sent — SMTP is unavailable');
    }
    return config.isDev;
  }

  try {
    await t.sendMail({
      from: config.smtp.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    logger.info({ to: input.to, subject: input.subject }, 'Email sent');
    return true;
  } catch (error) {
    logger.error({ err: error, to: input.to }, 'Failed to send email');
    return false;
  }
}
