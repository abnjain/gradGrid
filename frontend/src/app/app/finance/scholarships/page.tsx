"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ScholarshipsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Scholarships"
      description="Manage scholarship programs and student awards."
    />
  );
}
