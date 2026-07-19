"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AcademicRecordsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Academic Records"
      description="View academic history, grades, and performance reports for this student."
    />
  );
}
