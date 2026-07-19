"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ParentsDirectoryPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Parents Directory"
      description="View and manage parent and guardian records."
    />
  );
}
