"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell type="institution" institutionName="Demo Institution" sessionName="2025–2026">
      {children}
    </AppShell>
  );
}
