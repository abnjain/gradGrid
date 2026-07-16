/**
 * GradGrid — Encryption Utility
 *
 * Provides AES-256-GCM encryption/decryption for sensitive fields.
 * Uses the configured encryption key from environment.
 *
 * For MVP this provides basic encryption; envelope encryption with
 * HSM-backed master keys is planned for a future phase.
 */

import crypto from 'crypto';
import { config } from '../../config';
import { InternalError } from '../errors';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce for GCM
const TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const key = config.encryption.key;
  if (!key) {
    throw new InternalError('Encryption key is not configured');
  }
  // Support both hex and raw keys
  const hexMatch = key.match(/^[0-9a-fA-F]+$/);
  return hexMatch ? Buffer.from(key, 'hex') : Buffer.from(key, 'utf-8');
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns { encrypted, iv } where both are base64-encoded strings.
 */
export function encrypt(
  plaintext: string
): { encrypted: string; iv: string } {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf-8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encrypted: `${encrypted}:${authTag.toString('base64')}`,
    iv: iv.toString('base64'),
  };
}

/**
 * Decrypts ciphertext that was encrypted with encrypt().
 */
export function decrypt(
  encrypted: string,
  iv: string
): string {
  const key = getKey();

  // Split combined ciphertext and auth tag
  const [ciphertext, authTagBase64] = encrypted.split(':');
  if (!ciphertext || !authTagBase64) {
    throw new Error('Invalid encrypted format');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

  let decrypted = decipher.update(ciphertext, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

/**
 * Masks sensitive data showing only the last 4 characters.
 * E.g., "XXXX-XXXX-1234"
 */
export function mask(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) return value;
  const visible = value.slice(-visibleChars);
  const masked = value.slice(0, -visibleChars).replace(/./g, 'X');
  return masked + visible;
}
