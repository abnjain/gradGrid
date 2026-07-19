"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AttendanceRegisterPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Attendance Register"
      description="View the daily attendance register with summary statistics."
    />
  );
}
