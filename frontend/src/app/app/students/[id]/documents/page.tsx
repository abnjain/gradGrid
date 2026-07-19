"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function StudentDocumentsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Student Documents"
      description="Upload and manage documents for this student."
    />
  );
}
