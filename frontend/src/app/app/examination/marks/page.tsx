"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function EnterMarksPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Enter Marks"
      description="Enter and manage marks for examinations."
    />
  );
}
