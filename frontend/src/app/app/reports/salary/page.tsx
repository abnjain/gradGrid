"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function SalaryReportsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Salary Reports"
      description="View salary disbursement and payroll reports."
    />
  );
}
