"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ParentDetailsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Parent Details"
      description="View parent information and linked students."
    />
  );
}
