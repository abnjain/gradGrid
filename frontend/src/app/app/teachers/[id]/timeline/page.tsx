"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function TeacherTimelinePage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Teacher Timeline"
      description="View employment and activity timeline."
    />
  );
}
