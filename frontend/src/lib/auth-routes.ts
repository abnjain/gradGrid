/**
 * GradGrid — Auth route helpers
 *
 * Three portals: platform (/platform), institution (/app), learner (/portal).
 */

export type AuthAudience = "platform" | "institution" | "portal";
export type AuthUserType = "platform" | "institution" | "parent" | "student";

export const INSTITUTION_AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export const PLATFORM_AUTH_PATHS = [
  "/platform/login",
  "/platform/forgot-password",
  "/platform/reset-password",
] as const;

export const PORTAL_AUTH_PATHS = [
  "/portal/login",
  "/portal/forgot-password",
  "/portal/reset-password",
] as const;

export const AUTH_PATHS = [
  ...INSTITUTION_AUTH_PATHS,
  ...PLATFORM_AUTH_PATHS,
  ...PORTAL_AUTH_PATHS,
] as const;

export const TENANT_SELECT_PATHS = [
  "/app/select-organization",
  "/app/select-campus",
] as const;

export const PROTECTED_PREFIXES = ["/app", "/platform", "/portal"] as const;

export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_COOKIE_PLATFORM = "refreshToken_platform";
export const REFRESH_COOKIE_INSTITUTION = "refreshToken_institution";
export const REFRESH_COOKIE_PORTAL = "refreshToken_portal";
export const PORTAL_COOKIE_NAME = "gradgrid_portal";

export function refreshCookieForAudience(audience: AuthAudience): string {
  if (audience === "platform") return REFRESH_COOKIE_PLATFORM;
  if (audience === "portal") return REFRESH_COOKIE_PORTAL;
  return REFRESH_COOKIE_INSTITUTION;
}

export function audienceFromUserType(userType?: string | null): AuthAudience {
  if (userType === "platform") return "platform";
  if (userType === "parent" || userType === "student" || userType === "portal") {
    return "portal";
  }
  return "institution";
}

export function authApiPrefix(audience: AuthAudience): string {
  return `/auth/${audience}`;
}

export function loginPathForAudience(audience: AuthAudience): string {
  if (audience === "platform") return "/platform/login";
  if (audience === "portal") return "/portal/login";
  return "/login";
}

/** Institution portal entry — org selection is always shown after login. */
export function getInstitutionPortalEntry(): string {
  return "/app/select-organization";
}

/** Default landing page per portal. */
export function getPortalHome(userType?: string | null): string {
  const audience = audienceFromUserType(userType);
  if (audience === "platform") return "/platform/dashboard";
  if (audience === "portal") return "/portal/home";
  return getInstitutionPortalEntry();
}

export function isTenantSelectPath(pathname: string): boolean {
  return TENANT_SELECT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function resolvePostAuthRedirect(
  userType: string | undefined | null,
  returnUrl?: string | null,
  hasTenantContext?: boolean
): string {
  const audience = audienceFromUserType(userType);

  if (audience === "platform") {
    if (returnUrl && isSafeReturnUrl(returnUrl, "platform")) return returnUrl;
    return "/platform/dashboard";
  }

  if (audience === "portal") {
    if (returnUrl && isSafeReturnUrl(returnUrl, "portal")) return returnUrl;
    return "/portal/home";
  }

  if (returnUrl && isSafeReturnUrl(returnUrl, "institution")) {
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

export function isSafeReturnUrl(url: string, audience?: AuthAudience): boolean {
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  if (AUTH_PATHS.some((p) => url === p || url.startsWith(`${p}/`))) return false;
  if (audience === "platform") return url === "/platform" || url.startsWith("/platform/");
  if (audience === "portal") return url === "/portal" || url.startsWith("/portal/");
  if (audience === "institution") return url === "/app" || url.startsWith("/app/");
  return PROTECTED_PREFIXES.some((p) => url === p || url.startsWith(`${p}/`));
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function audienceFromPathname(pathname: string): AuthAudience | null {
  if (pathname === "/platform" || pathname.startsWith("/platform/")) return "platform";
  if (pathname === "/portal" || pathname.startsWith("/portal/")) return "portal";
  if (pathname === "/app" || pathname.startsWith("/app/")) return "institution";
  return null;
}

export function setPortalCookie(userType: AuthUserType | AuthAudience) {
  if (typeof document === "undefined") return;
  const value = audienceFromUserType(userType);
  document.cookie = `${PORTAL_COOKIE_NAME}=${value}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
}

export function clearPortalCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${PORTAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
}

export function clearRefreshCookie(audience?: AuthAudience) {
  if (typeof document === "undefined") return;
  const names = audience
    ? [refreshCookieForAudience(audience), REFRESH_COOKIE_NAME]
    : [
        REFRESH_COOKIE_NAME,
        REFRESH_COOKIE_PLATFORM,
        REFRESH_COOKIE_INSTITUTION,
        REFRESH_COOKIE_PORTAL,
      ];
  const paths = [
    "/",
    "/api/v1/auth/refresh",
    "/api/v1/auth/platform/refresh",
    "/api/v1/auth/institution/refresh",
    "/api/v1/auth/portal/refresh",
  ];
  for (const name of names) {
    for (const path of paths) {
      document.cookie = `${name}=; path=${path}; max-age=0; SameSite=Lax`;
    }
  }
}
