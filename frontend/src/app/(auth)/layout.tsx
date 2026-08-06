import type { Metadata } from "next";
import React from "react";

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
  return <>{children}</>;
}
