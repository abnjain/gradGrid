import type { Metadata } from "next";
import React from "react";
import { AppShell } from "@/components/layout";
import { ProtectedRouteGuard } from "@/components/auth/protected-route-guard";

export const metadata: Metadata = {
  title: "Platform | GradGrid",
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRouteGuard audience="platform">
      <AppShell type="platform">{children}</AppShell>
    </ProtectedRouteGuard>
  );
}
