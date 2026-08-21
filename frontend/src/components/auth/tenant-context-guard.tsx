"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getInstitutionPortalEntry, isTenantSelectPath } from "@/lib/auth-routes";
import { ProtectedRouteGuard } from "@/components/auth/protected-route-guard";

/**
 * Ensures institution users have selected org + campus before accessing portal modules.
 */
export function TenantContextGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, tenantContext } = useAuth();

  React.useEffect(() => {
    if (isLoading || !isAuthenticated || user?.userType === "platform") return;
    if (isTenantSelectPath(pathname)) return;
    if (!tenantContext?.institutionId) {
      router.replace(getInstitutionPortalEntry());
    }
  }, [isAuthenticated, isLoading, pathname, router, tenantContext?.institutionId, user?.userType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-sm text-mid">Loading…</div>
      </div>
    );
  }

  if (
    isAuthenticated &&
    user?.userType === "institution" &&
    !isTenantSelectPath(pathname) &&
    !tenantContext?.institutionId
  ) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-sm text-mid">Redirecting…</div>
      </div>
    );
  }

  return <ProtectedRouteGuard audience="institution">{children}</ProtectedRouteGuard>;
}
