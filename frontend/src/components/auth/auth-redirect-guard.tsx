"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isAuthPath, resolvePostAuthRedirect } from "@/lib/auth-routes";

/**
 * Client-side complement to middleware.
 * Redirects authenticated users off auth pages once profile is loaded,
 * using the correct portal home (platform vs institution).
 */
export function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();

  React.useEffect(() => {
    if (isLoading || !isAuthenticated || !isAuthPath(pathname)) return;

    const returnUrl = searchParams.get("returnUrl");
    const destination = resolvePostAuthRedirect(user?.userType, returnUrl);
    router.replace(destination);
  }, [isAuthenticated, isLoading, pathname, router, searchParams, user?.userType]);

  if (isLoading && isAuthPath(pathname)) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-sm text-mid">Loading…</div>
      </div>
    );
  }

  if (isAuthenticated && isAuthPath(pathname)) {
    return (
      <div className="min-h-screen bg-fog flex items-center justify-center">
        <div className="text-sm text-mid">Redirecting…</div>
      </div>
    );
  }

  return <>{children}</>;
}
