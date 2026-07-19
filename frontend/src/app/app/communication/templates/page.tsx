"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function MessageTemplatesPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Message Templates"
      description="Create and manage reusable message templates."
    />
  );
}
