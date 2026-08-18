import type { Metadata } from "next";
import React, { Suspense } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";

export const metadata: Metadata = {
  title: {
    default: "GradGrid — Education ERP Platform",
    template: "%s | GradGrid",
  },
  description: "Sign in to your GradGrid institution or admin portal.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50 border border-border rounded-sm bg-surface/80 backdrop-blur-sm">
        <ThemeToggle />
      </div>
      <Suspense
        fallback={
          <div className="min-h-screen bg-fog flex items-center justify-center">
            <div className="text-sm text-mid">Loading…</div>
          </div>
        }
      >
        <AuthRedirectGuard>{children}</AuthRedirectGuard>
      </Suspense>
    </>
  );
}
