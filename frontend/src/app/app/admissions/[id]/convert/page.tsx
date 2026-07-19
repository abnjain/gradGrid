"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function ConvertApplicationPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Convert Application"
      description="Convert this application to an enrolled student record."
    />
  );
}
