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

export const TENANT_SELECT_PATHS = [
  "/app/select-organization",
  "/app/select-campus",
] as const;

export const PROTECTED_PREFIXES = ["/app", "/admin"] as const;

export const REFRESH_COOKIE_NAME = "refreshToken";
export const PORTAL_COOKIE_NAME = "gradgrid_portal";

/** Institution portal entry — org selection is always shown after login. */
export function getInstitutionPortalEntry(): string {
  return "/app/select-organization";
}

/** Default landing page per portal (IA: institution → select org, platform → /admin). */
export function getPortalHome(userType?: string | null): string {
  return userType === "platform" ? "/admin/dashboard" : getInstitutionPortalEntry();
}

export function isTenantSelectPath(pathname: string): boolean {
  return TENANT_SELECT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Resolve post-login destination — honours returnUrl when safe. */
export function resolvePostAuthRedirect(
  userType: string | undefined | null,
  returnUrl?: string | null,
  hasTenantContext?: boolean
): string {
  if (userType === "platform") {
    return "/admin/dashboard";
  }

  if (returnUrl && isSafeReturnUrl(returnUrl)) {
    if (!hasTenantContext && !isTenantSelectPath(returnUrl)) {
      return getInstitutionPortalEntry();
    }
    return returnUrl;
  }

  if (!hasTenantContext) {
    return getInstitutionPortalEntry();
  }

  return "/app/dashboard";
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

export function setPortalCookie(userType: AuthUserType) {
  if (typeof document === "undefined") return;
  document.cookie = `${PORTAL_COOKIE_NAME}=${userType}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
}

export function clearPortalCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PORTAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
}
