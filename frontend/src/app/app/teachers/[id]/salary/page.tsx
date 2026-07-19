"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function TeacherSalaryPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Teacher Salary"
      description="View and manage salary details, pay slips, and compensation history."
    />
  );
}
