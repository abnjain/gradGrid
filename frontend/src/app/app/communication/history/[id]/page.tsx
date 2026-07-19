"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function MessageDetailsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Message Details"
      description="View detailed message information and delivery status."
    />
  );
}
