import type { Metadata } from "next";
import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Institution Portal | GradGrid",
  robots: { index: false, follow: false },
};

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell type="institution" institutionName="Demo Institution" sessionName="2025–2026">
      {children}
    </AppShell>
  );
}
