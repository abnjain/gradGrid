"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Construction } from "lucide-react";

export default function BookDetailsPage() {
  return (
    <EmptyState
      icon={<Construction className="w-12 h-12" />}
      title="Book Details"
      description="View book details, availability, and borrowing history."
    />
  );
}
