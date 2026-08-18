/**
 * Generate a URL-safe slug from an organization name.
 */
export function slugifyOrganizationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'organization';
}

/**
 * Generate a random 6-digit OTP string.
 */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Normalize institution code to uppercase alphanumeric + hyphen.
 */
export function normalizeInstitutionCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}
