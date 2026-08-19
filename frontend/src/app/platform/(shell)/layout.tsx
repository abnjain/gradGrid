import type { Metadata } from "next";
import React from "react";
import { AppShell } from "@/components/layout";

export const metadata: Metadata = {
  title: "Platform | GradGrid",
  robots: { index: false, follow: false },
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <AppShell type="platform">{children}</AppShell>;
}
