"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function FeeReportsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Fee Reports"
      description="View fee collection reports, arrears, and revenue analysis."
    />
  );
}
