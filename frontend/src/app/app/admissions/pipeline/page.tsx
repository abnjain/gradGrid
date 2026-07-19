"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AdmissionsPipelinePage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Admissions Pipeline"
      description="Track the admission pipeline from inquiry to enrollment."
    />
  );
}
