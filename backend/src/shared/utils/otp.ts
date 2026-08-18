/**
 * Fast OTP hashing — bcrypt is too slow on Render free tier for 6-digit codes.
 */

import { createHash, timingSafeEqual } from 'crypto';
import { config } from '../../config';

function otpDigest(otp: string): string {
  return createHash('sha256')
    .update(`${config.encryption.key}:${otp}`)
    .digest('hex');
}

export function hashOtp(otp: string): string {
  return otpDigest(otp);
}

export function verifyOtp(otp: string, hash: string): boolean {
  const candidate = otpDigest(otp);
  try {
    return timingSafeEqual(Buffer.from(candidate, 'utf8'), Buffer.from(hash, 'utf8'));
  } catch {
    return false;
  }
}
