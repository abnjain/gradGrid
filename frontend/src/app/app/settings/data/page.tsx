"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function DataManagementPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Data Management"
      description="Manage data retention, backup, and archiving settings."
    />
  );
}
