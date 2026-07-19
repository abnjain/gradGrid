"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ApplicationDetailsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Application Details"
      description="View complete admission application details and status."
    />
  );
}
