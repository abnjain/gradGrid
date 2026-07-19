"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function SalaryManagementPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Salary Management"
      description="Manage staff salaries, payslips, and disbursements."
    />
  );
}
