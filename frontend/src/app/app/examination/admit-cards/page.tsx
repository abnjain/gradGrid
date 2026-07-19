"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AdmitCardsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Admit Cards"
      description="Generate examination admit cards for students."
    />
  );
}
