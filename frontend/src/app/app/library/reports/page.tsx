"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function LibraryReportsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Library Reports"
      description="Generate library usage and inventory reports."
    />
  );
}
