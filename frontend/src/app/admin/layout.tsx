import type { Metadata } from "next";
import React from "react";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Platform Admin | GradGrid",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell type="admin">
      {children}
    </AppShell>
  );
}
