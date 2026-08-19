"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const permissions = user?.permissions ?? [];

  const can = useCallback(
    (key: string) => isAuthenticated && permissions.includes(key),
    [isAuthenticated, permissions]
  );

  const canAny = useCallback(
    (...keys: string[]) => keys.some((key) => can(key)),
    [can]
  );

  return useMemo(
    () => ({
      permissions,
      can,
      canAny,
      loaded: isAuthenticated,
    }),
    [can, canAny, isAuthenticated, permissions]
  );
}
