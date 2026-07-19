"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ReturnBooksPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Return Books"
      description="Process book returns and manage fines."
    />
  );
}
