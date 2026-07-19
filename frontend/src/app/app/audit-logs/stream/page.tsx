"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function LiveAuditStreamPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Live Audit Stream"
      description="View real-time audit log stream of system activities."
    />
  );
}
