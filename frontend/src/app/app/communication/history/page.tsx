"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function CommunicationHistoryPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Communication History"
      description="View sent messages, delivery status, and responses."
    />
  );
}
