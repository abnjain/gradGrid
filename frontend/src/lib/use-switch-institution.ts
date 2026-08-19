"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getInstitutionPortalEntry } from "@/lib/auth-routes";

/** Clear active campus context and return to organization/campus selection. */
export function useSwitchInstitution() {
  const router = useRouter();
  const { clearTenantContext } = useAuth();

  return useCallback(() => {
    clearTenantContext();
    router.push(getInstitutionPortalEntry());
  }, [clearTenantContext, router]);
}
