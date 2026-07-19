"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ExamConfigurationPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Exam Configuration"
      description="Configure examination types, grading scales, and terms."
    />
  );
}
