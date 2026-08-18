import type { Metadata } from "next";
import React from "react";
import { InstitutionAppLayout } from "@/components/layout/institution-app-layout";

export const metadata: Metadata = {
  title: "Institution Portal | GradGrid",
  robots: { index: false, follow: false },
};

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return <InstitutionAppLayout>{children}</InstitutionAppLayout>;
}
