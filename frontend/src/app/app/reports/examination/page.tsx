"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ExaminationReportsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Examination Reports"
      description="View exam performance analysis and grade distribution."
    />
  );
}
