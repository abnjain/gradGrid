"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function BrandingPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Branding"
      description="Customize institution branding, themes, and portal appearance."
    />
  );
}
