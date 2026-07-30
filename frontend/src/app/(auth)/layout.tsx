import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Sign In | GradGrid",
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
