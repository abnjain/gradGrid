"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function LibraryCardsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Library Cards"
      description="Manage library card issuance and renewals."
    />
  );
}
