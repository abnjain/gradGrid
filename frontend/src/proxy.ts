import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_PATHS,
  REFRESH_COOKIE_NAME,
  getPortalHome,
  isAuthPath,
  isProtectedPath,
  isSafeReturnUrl,
} from "@/lib/auth-routes";

/**
 * Server-side auth boundary (Implementation Ideation §2.2 F1/F2).
 *
 * - Blocks unauthenticated access to /app/* and /admin/*
 * - Redirects authenticated users away from auth pages
 * - Preserves returnUrl for post-login redirect
 *
 * Uses the httpOnly refreshToken cookie as the session indicator.
 * Fine-grained token validation remains in AuthProvider (client).
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath(pathname) && hasSession) {
    const returnUrl = searchParams.get("returnUrl");
    const destination =
      returnUrl && isSafeReturnUrl(returnUrl) ? returnUrl : getPortalHome();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = destination;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    ...AUTH_PATHS,
  ],
};
