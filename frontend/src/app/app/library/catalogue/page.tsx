"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function LibraryCataloguePage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Library Catalogue"
      description="Browse the complete library catalogue and search for books."
    />
  );
}
