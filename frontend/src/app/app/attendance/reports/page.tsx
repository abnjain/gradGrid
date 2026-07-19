"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AttendanceReportsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Attendance Reports"
      description="Generate and view attendance reports, trends, and analytics."
    />
  );
}
