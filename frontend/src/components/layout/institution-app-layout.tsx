"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AppShell } from "@/components/layout/app-shell";
import { TenantContextGuard } from "@/components/auth/tenant-context-guard";
import { useAuth } from "@/lib/auth-context";
import { isTenantSelectPath } from "@/lib/auth-routes";

export function InstitutionAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenantContext } = useAuth();
  const isSelectFlow = isTenantSelectPath(pathname);

  if (isSelectFlow) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 border border-border rounded-sm bg-surface/80 backdrop-blur-sm">
          <ThemeToggle />
        </div>
        <div className="min-h-screen bg-fog flex flex-col">
          <header className="px-6 py-5 border-b border-border bg-surface">
            <Link href="/" className="text-lg font-bold font-display text-ink no-underline hover:no-underline">
              GradGrid
            </Link>
          </header>
          <main className="flex-1 flex items-center justify-center p-6">{children}</main>
        </div>
      </>
    );
  }

  return (
    <TenantContextGuard>
      <AppShell
        type="institution"
        institutionName={tenantContext?.institutionName}
        organizationName={tenantContext?.organizationName}
        sessionName="2025–2026"
      >
        {children}
      </AppShell>
    </TenantContextGuard>
  );
}
