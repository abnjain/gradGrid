/**
 * GradGrid — Auth audience helpers
 *
 * Three login audiences: platform, institution, portal (parent/student).
 */

export type AuthAudience = 'platform' | 'institution' | 'portal';

export const AUTH_AUDIENCES = ['platform', 'institution', 'portal'] as const;

export function audienceForUserType(userType: string): AuthAudience {
  if (userType === 'platform') return 'platform';
  if (userType === 'parent' || userType === 'student') return 'portal';
  return 'institution';
}

export function userTypesForAudience(audience: AuthAudience): string[] {
  if (audience === 'platform') return ['platform'];
  if (audience === 'portal') return ['parent', 'student'];
  return ['institution'];
}

export function refreshCookieName(audience: AuthAudience): string {
  return `refreshToken_${audience}`;
}

export function isUserTypeAllowed(userType: string, audience: AuthAudience): boolean {
  return userTypesForAudience(audience).includes(userType);
}
