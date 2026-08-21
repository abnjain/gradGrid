"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  audienceFromUserType,
  loginPathForAudience,
  type AuthAudience,
} from "@/lib/auth-routes";

interface ProtectedRouteGuardProps {
  audience: AuthAudience;
  children: React.ReactNode;
}

/**
 * Client-side boundary for protected portals.
 *
 * The proxy protects normal navigations, while this guard handles logout,
 * browser back/forward cache, and direct client-side navigation after a
 * session expires.
 */
export function ProtectedRouteGuard({ audience, children }: ProtectedRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const hasExpectedAudience =
    isAuthenticated && audienceFromUserType(user?.userType) === audience;

  React.useEffect(() => {
    if (isLoading || hasExpectedAudience) return;
    router.replace(loginPathForAudience(audience));
  }, [audience, hasExpectedAudience, isLoading, pathname, router]);

  if (isLoading || !hasExpectedAudience) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-sm text-mid">{isLoading ? "Loading…" : "Redirecting to login…"}</div>
      </div>
    );
  }

  return <>{children}</>;
}
