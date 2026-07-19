"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AcademicSessionsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Academic Sessions"
      description="Configure academic sessions, terms, and holidays."
    />
  );
}
