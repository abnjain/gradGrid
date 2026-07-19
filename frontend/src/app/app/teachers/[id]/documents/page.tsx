"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function TeacherDocumentsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Teacher Documents"
      description="Upload and manage certificates and documents."
    />
  );
}
