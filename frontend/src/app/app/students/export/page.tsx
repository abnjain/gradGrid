"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ExportStudentsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Export Students"
      description="Export student data to CSV or Excel format. This feature is coming soon."
    />
  );
}
