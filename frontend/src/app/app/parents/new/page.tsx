"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function AddParentPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Add Parent"
      description="Register a new parent or guardian record."
    />
  );
}
