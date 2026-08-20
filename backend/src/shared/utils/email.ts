/**
 * GradGrid — Email Service
 *
 * Transactional email is sent through Resend's HTTPS API. This works on
 * Render Free, where outbound SMTP ports are blocked. In development, an
 * absent API key keeps the existing log-only behavior.
 */

import { config } from '../../config';
import { createContextLogger } from './logger';

const logger = createContextLogger({ module: 'email' });
const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface ResendResponse {
  id?: string;
  name?: string;
  message?: string;
}

function isResendConfigured(): boolean {
  return config.email.provider === 'resend' && Boolean(config.email.resendApiKey && config.email.from);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readResendResponse(response: Response): Promise<ResendResponse> {
  try {
    const body: unknown = await response.json();
    if (!isRecord(body)) return {};

    return {
      id: typeof body.id === 'string' ? body.id : undefined,
      name: typeof body.name === 'string' ? body.name : undefined,
      message: typeof body.message === 'string' ? body.message : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Validate email configuration at startup. Resend has no non-delivery
 * verification endpoint, so actual provider reachability is checked when a
 * message is sent and the response is logged with its provider message ID.
 */
export async function verifyEmailTransport(): Promise<boolean> {
  if (!isResendConfigured()) {
    logger.error(
      { provider: config.email.provider, apiKeyConfigured: Boolean(config.email.resendApiKey) },
      'Resend email provider is not configured'
    );
    return false;
  }

  logger.info(
    { provider: 'resend', fromConfigured: Boolean(config.email.from) },
    'Resend email provider configured'
  );
  return true;
}

/**
 * Send an email. Returns true when Resend accepts the message, or when the
 * message is logged in development without a provider key.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!isResendConfigured()) {
    if (config.isDev) {
      logger.info(
        {
          to: input.to,
          subject: input.subject,
          text: input.text,
        },
        'EMAIL_DEV_LOG — would send email'
      );
      return true;
    }

    logger.error(
      { provider: config.email.provider, to: input.to, subject: input.subject },
      'Email not sent — Resend is unavailable'
    );
    return false;
  }

  try {
    const response = await fetch(RESEND_EMAILS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.email.resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GradGrid/1.0',
      },
      body: JSON.stringify({
        from: config.email.from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });
    const result = await readResendResponse(response);

    if (!response.ok) {
      logger.error(
        {
          provider: 'resend',
          status: response.status,
          code: result.name,
          message: result.message,
          to: input.to,
          subject: input.subject,
        },
        'Failed to send email through Resend'
      );
      return false;
    }

    logger.info(
      { provider: 'resend', messageId: result.id, to: input.to, subject: input.subject },
      'Email accepted by Resend'
    );
    return true;
  } catch (error) {
    logger.error(
      { err: error, provider: 'resend', to: input.to, subject: input.subject },
      'Email request to Resend failed'
    );
    return false;
  }
}
