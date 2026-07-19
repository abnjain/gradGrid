"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function FeeStructuresPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Fee Structures"
      description="Configure fee structures for different classes and categories."
    />
  );
}
