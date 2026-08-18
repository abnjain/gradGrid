/**
 * GradGrid — Auth route helpers
 *
 * Shared logic for middleware, login redirect, and portal routing.
 */

export type AuthUserType = "platform" | "institution";

export const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export const PROTECTED_PREFIXES = ["/app", "/admin"] as const;

export const REFRESH_COOKIE_NAME = "refreshToken";

/** Default landing page per portal (IA: institution → /app, platform → /admin). */
export function getPortalHome(userType?: string | null): string {
  return userType === "platform" ? "/admin/dashboard" : "/app/dashboard";
}

/** Resolve post-login destination — honours returnUrl when safe. */
export function resolvePostAuthRedirect(
  userType: string | undefined | null,
  returnUrl?: string | null
): string {
  if (returnUrl && isSafeReturnUrl(returnUrl)) {
    return returnUrl;
  }
  return getPortalHome(userType);
}

/** Only allow internal relative paths (prevents open redirects). */
export function isSafeReturnUrl(url: string): boolean {
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  if (AUTH_PATHS.some((p) => url.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some((p) => url.startsWith(p));
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
