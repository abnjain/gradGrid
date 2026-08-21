import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PORTAL_COOKIE_NAME,
  LOGGED_OUT_COOKIE_NAME,
  audienceFromPathname,
  getPortalHome,
  isAuthPath,
  isProtectedPath,
  isSafeReturnUrl,
  loginPathForAudience,
  refreshCookieForAudience,
  REFRESH_COOKIE_NAME,
  type AuthAudience,
} from "@/lib/auth-routes";

function hasAudienceSession(request: NextRequest, audience: AuthAudience): boolean {
  return (
    request.cookies.has(refreshCookieForAudience(audience)) ||
    request.cookies.has(REFRESH_COOKIE_NAME)
  );
}

/**
 * Server-side auth boundary for /platform, /app, and /portal.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const pathAudience = audienceFromPathname(pathname);
  const authPath = isAuthPath(pathname);
  const loggedOut = request.cookies.has(LOGGED_OUT_COOKIE_NAME);

  if (isProtectedPath(pathname) && !authPath && pathAudience && (loggedOut || !hasAudienceSession(request, pathAudience))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPathForAudience(pathAudience);
    loginUrl.search = "";
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedPath(pathname) && pathAudience) {
    const portalType = request.cookies.get(PORTAL_COOKIE_NAME)?.value;
    if (portalType && portalType !== pathAudience) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = loginPathForAudience(pathAudience);
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthPath(pathname)) {
    let authAudience: AuthAudience = "institution";
    if (pathname.startsWith("/platform/")) authAudience = "platform";
    else if (pathname.startsWith("/portal/")) authAudience = "portal";

    if (!loggedOut && hasAudienceSession(request, authAudience)) {
      const returnUrl = searchParams.get("returnUrl");
      const portalType = request.cookies.get(PORTAL_COOKIE_NAME)?.value || authAudience;
      const destination =
        returnUrl && isSafeReturnUrl(returnUrl, authAudience)
          ? returnUrl
          : getPortalHome(portalType);

      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = destination;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/platform/:path*",
    "/portal/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
