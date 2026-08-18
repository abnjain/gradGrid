/**
 * GradGrid — Password Utility
 *
 * Wraps bcrypt for consistent password hashing across the application.
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = process.env.NODE_ENV === 'production' ? 8 : 12;

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
