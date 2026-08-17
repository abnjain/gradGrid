import type { Metadata } from "next";
import React from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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
      {/* Theme toggle — fixed top-right across all auth pages */}
      <div className="fixed top-4 right-4 z-50 border border-border rounded-sm bg-surface/80 backdrop-blur-sm">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
